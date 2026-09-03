import { supabase } from "@/services/supabase"

export const PRODUCT_IMAGES_BUCKET = "product-images"
const SIGNED_URL_TTL_SECONDS = 60 * 60

function extensionForMimeType(mimeType: string): string {
  if (mimeType === "image/png") return "png"
  if (mimeType === "image/webp") return "webp"
  if (mimeType === "image/gif") return "gif"
  return "jpg"
}
export function isLegacyProductImage(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("data:image/")
}

export async function uploadProductImage(productId: string, dataUrl: string): Promise<string> {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  const extension = extensionForMimeType(blob.type)
  const path = `products/${productId}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, blob, {
    cacheControl: "31536000",
    contentType: blob.type,
    upsert: false,
  })

  if (error) throw error

  // Verify the private object is readable before associating it with the product.
  const { data: verification, error: verificationError } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .createSignedUrl(path, 60)
  if (verificationError || !verification?.signedUrl) {
    throw verificationError ?? new Error("Não foi possível verificar a foto enviada.")
  }

  return path
}

export async function createProductImageUrlMap(paths: string[]): Promise<Map<string, string>> {
  const uniquePaths = [...new Set(paths.filter(Boolean))]
  if (uniquePaths.length === 0) return new Map()

  const { data, error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .createSignedUrls(uniquePaths, SIGNED_URL_TTL_SECONDS)
  if (error) throw error

  const urls = new Map<string, string>()
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl)
  }
  return urls
}
