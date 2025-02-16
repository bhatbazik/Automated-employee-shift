const z = require('zod');

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(3),
  role: z.enum(['employee', 'admin']).optional(),
  seniorityLevel: z.enum(['junior', 'mid', 'senior']).optional(),
  maxHoursPerWeek: z.number().min(1).max(40).optional()
});

module.exports = { signupSchema };