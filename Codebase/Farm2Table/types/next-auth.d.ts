import 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: string
    farmId?: string
    plan?: string
  }

  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      role?: string
      farmId?: string
      plan?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    farmId?: string
    plan?: string
  }
}

