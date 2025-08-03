import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { jwt } from '@elysiajs/jwt'
import { MikroORM, RequestContext } from '@mikro-orm/core'
import * as bcrypt from 'bcrypt'

// --- MikroORM and Entity Imports ---
import ormConfig from './mikro-orm.config'
import { User } from './entities/User'

// --- Environment Variables ---
const PORT = Number(Bun.env.PORT) ?? 8084
const JWT_SECRET = Bun.env.JWT_SECRET ?? 'a-very-secure-and-long-secret-for-jwt'
const IS_PRODUCTION = Bun.env.NODE_ENV === 'production'
const ADMIN_EMAIL = Bun.env.ADMIN_EMAIL
const ADMIN_PASSWORD = Bun.env.ADMIN_PASSWORD

console.log('🚀 Initializing Elysia server...')
if (IS_PRODUCTION) {
    console.log('Running in PRODUCTION mode.')
} else {
    console.log('Running in DEVELOPMENT mode.')
}

// --- MikroORM Initialization ---
const orm = await MikroORM.init(ormConfig)
// This ensures your database schema is up-to-date with your entities.
await orm.schema.updateSchema()
console.log('✔ Database schema updated.')

// --- System User and Initial Invite Code Seeding ---
if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    console.log('Attempting to seed system administrator...')
    const em = orm.em.fork() // Use a fork of the entity manager for this operation
    const existingAdmin = await em.findOne(User, { email: ADMIN_EMAIL })

    if (!existingAdmin) {
        console.log(`Admin user with email ${ADMIN_EMAIL} not found, creating...`)

        // Create the admin user
        const adminUser = em.create(User, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        })

        // Persist both the user and their new invite code
        await em.persistAndFlush([adminUser])

        console.log(`✔ Admin user created successfully with email: ${ADMIN_EMAIL}`)
    } else {
        console.log('Admin user already exists.')
    }
} else {
    console.log('ADMIN_EMAIL or ADMIN_PASSWORD not set in .env. Skipping admin user seeding.')
}

// --- Create the base app ---
let app = new Elysia({
    serve: {
        hostname: '0.0.0.0',
        port: PORT
    }
})
    // --- Essential Middleware ---
    .use(cors()) // Handles CORS headers automatically
    .use(
        jwt({
            name: 'jwt',
            secret: JWT_SECRET
        })
    )
    // Middleware to create a unique request context for MikroORM
    .use((app) =>
        app.onRequest((context) => {
            RequestContext.create(orm.em, () => {
                context.store = { ...context.store, em: orm.em.fork() }
            })
        })
    )

    // --- Group: Public Authentication Routes ---
    .group('/auth', (app) =>
        app
            .post(
                '/register',
                async ({ body, store, set }) => {
                    const { em } = store as { em: typeof orm.em }
                    const { email, password } = body

                    // 1. Check if user already exists
                    const existingUser = await em.findOne(User, { email })
                    if (existingUser) {
                        set.status = 409 // Conflict
                        return { error: 'An account with this email already exists.' }
                    }

                    // 2. Create the new user
                    const newUser = em.create(User, {
                        email,
                        password // Password will be hashed by the @BeforeCreate hook
                    })

                    // 3. Persist new user
                    await em.persistAndFlush(newUser)

                    set.status = 201
                    return { message: 'User registered successfully!', userId: newUser.id }
                },
                {
                    body: t.Object({
                        email: t.String({ format: 'email' }),
                        password: t.String({ minLength: 8 }),
                        inviteCode: t.String()
                    })
                }
            )
            .post(
                '/login',
                async ({ body, jwt, set, store }) => {
                    const { em } = store as { em: typeof orm.em }
                    const user = await em.findOne(User, { email: body.email })

                    if (!user || !(await bcrypt.compare(body.password, user.password))) {
                        set.status = 401 // Unauthorized
                        return { error: 'Invalid email or password.' }
                    }

                    const token = await jwt.sign({ id: user.id, email: user.email })
                    return { message: 'Login successful!', token }
                },
                {
                    body: t.Object({
                        email: t.String(),
                        password: t.String()
                    })
                }
            )
    )

    // --- Group: JWT Authenticated API Routes ---
    .group('/api', (app) =>
        app
            // This 'onBeforeHandle' hook acts as a guard for all routes in this group.
            // It verifies the JWT before allowing the request to proceed.
            .onBeforeHandle(async ({ jwt, set, headers }) => {
                const authHeader = headers.authorization
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    set.status = 401
                    return { error: 'Authorization header is missing or malformed.' }
                }
                const payload = await jwt.verify(authHeader.substring(7))
                if (!payload) {
                    set.status = 401
                    return { error: 'Unauthorized: Invalid token.' }
                }
            })
            // --- MERGED ROUTES (Previously Legacy) ---
            .get('/ping', () => 'Pong')
    )

// --- Static File Serving (PRODUCTION ONLY) ---
if (IS_PRODUCTION) {
    app = app
        .use(
            staticPlugin({
                assets: 'dist',
                prefix: '',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    Pragma: 'no-cache',
                    Expires: '0'
                }
            })
        )
        .get('*', () => Bun.file('dist/index.html'))
}

// --- Start Server ---
app.listen(PORT)

console.log(`✔ Elysia server running at http://${app.server?.hostname}:${app.server?.port}`)
