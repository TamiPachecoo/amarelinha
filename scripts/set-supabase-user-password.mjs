import { createClient } from "@supabase/supabase-js"

function printUsage() {
  console.log("Usage:")
  console.log("  npm run supabase:set-password -- --email user@example.com --password 'NewPass123!'")
  console.log("")
  console.log("Required environment variables:")
  console.log("  SUPABASE_URL")
  console.log("  SUPABASE_SERVICE_ROLE_KEY")
}

function parseArgs(argv) {
  const args = { email: "", password: "" }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]

    if (token === "--email") {
      args.email = (argv[i + 1] ?? "").trim()
      i += 1
      continue
    }

    if (token === "--password") {
      args.password = argv[i + 1] ?? ""
      i += 1
      continue
    }
  }

  return args
}

async function findUserByEmail(supabase, email) {
  let page = 1
  const perPage = 200

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })

    if (error) {
      throw new Error(`Failed to list users: ${error.message}`)
    }

    const users = data?.users ?? []
    const matched = users.find((user) => (user.email ?? "").toLowerCase() === email)

    if (matched) {
      return matched
    }

    if (users.length < perPage) {
      return null
    }

    page += 1
  }
}

async function main() {
  const { email, password } = parseArgs(process.argv.slice(2))
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing required environment variables SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.")
    printUsage()
    process.exit(1)
  }

  if (!email || !password) {
    console.error("Missing required --email or --password argument.")
    printUsage()
    process.exit(1)
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.")
    process.exit(1)
  }

  const normalizedEmail = email.toLowerCase()

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const user = await findUserByEmail(supabase, normalizedEmail)

  if (!user) {
    console.error(`No Supabase user found with email: ${normalizedEmail}`)
    process.exit(1)
  }

  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password,
  })

  if (error) {
    console.error(`Failed to update password: ${error.message}`)
    process.exit(1)
  }

  console.log(`Password updated successfully for ${normalizedEmail} (user id: ${user.id}).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})