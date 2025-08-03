import { BeforeCreate, Entity, PrimaryKey, Property } from '@mikro-orm/core'
import * as bcrypt from 'bcrypt'

@Entity({ tableName: 'users' })
export class User {
    @PrimaryKey({ type: 'uuid' })
    id: string = Bun.randomUUIDv7()

    @Property({ unique: true })
    email!: string

    @Property({ hidden: true }) // Never return the password hash in responses
    password!: string

    @Property()
    createdAt: Date = new Date()

    @BeforeCreate()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10)
    }
}
