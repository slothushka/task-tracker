import '../setup';
import { User } from '../../../models/User';

describe('User Model — Unit Tests', () => {
  describe('Schema validation', () => {
    it('should create a user with valid data', async () => {
      const user = await User.create({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password123',
      });

      expect(user._id).toBeDefined();
      expect(user.name).toBe('Alice');
      expect(user.email).toBe('alice@example.com');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should hash the password before saving', async () => {
      const plainPassword = 'mysecretpassword';
      const user = await User.create({
        name: 'Bob',
        email: 'bob@example.com',
        password: plainPassword,
      });

      // Fetch with password field
      const fetched = await User.findById(user._id).select('+password');
      expect(fetched!.password).not.toBe(plainPassword);
      expect(fetched!.password).toMatch(/^\$2[ab]\$/); // bcrypt hash pattern
    });

    it('should not return password in default queries', async () => {
      await User.create({ name: 'Carol', email: 'carol@example.com', password: 'pass123' });
      const fetched = await User.findOne({ email: 'carol@example.com' });
      expect((fetched as Record<string, unknown>)?.password).toBeUndefined();
    });

    it('should lowercase and trim the email', async () => {
      const user = await User.create({
        name: 'Dave',
        email: '  DAVE@EXAMPLE.COM  ',
        password: 'pass123',
      });
      expect(user.email).toBe('dave@example.com');
    });

    it('should reject duplicate emails', async () => {
      await User.create({ name: 'Eve', email: 'eve@example.com', password: 'pass123' });
      await expect(
        User.create({ name: 'Eve2', email: 'eve@example.com', password: 'pass456' })
      ).rejects.toThrow();
    });

    it('should reject missing required fields', async () => {
      await expect(User.create({ email: 'x@x.com', password: 'pass' })).rejects.toThrow();
      await expect(User.create({ name: 'X', password: 'pass' })).rejects.toThrow();
      await expect(User.create({ name: 'X', email: 'x@x.com' })).rejects.toThrow();
    });

    it('should reject invalid email format', async () => {
      await expect(
        User.create({ name: 'X', email: 'not-an-email', password: 'pass123' })
      ).rejects.toThrow();
    });

    it('should reject short passwords', async () => {
      await expect(
        User.create({ name: 'X', email: 'x@x.com', password: '12' })
      ).rejects.toThrow();
    });
  });

  describe('comparePassword()', () => {
    it('should return true for correct password', async () => {
      const user = await User.create({
        name: 'Frank',
        email: 'frank@example.com',
        password: 'correctpassword',
      });
      const fetched = await User.findById(user._id).select('+password');
      expect(await fetched!.comparePassword('correctpassword')).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const user = await User.create({
        name: 'Grace',
        email: 'grace@example.com',
        password: 'correctpassword',
      });
      const fetched = await User.findById(user._id).select('+password');
      expect(await fetched!.comparePassword('wrongpassword')).toBe(false);
    });
  });
});
