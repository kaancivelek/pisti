import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Simple ENV parser since node --env-file might not be available depending on version
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI bulunamadı. Lütfen .env.local dosyasını kontrol et.");
  process.exit(1);
}

// User Şeması (Manuel tanımlıyoruz ki Next.js TS importlarıyla uğraşmayalım)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB'ye bağlanıldı!");

    const adminEmail = "admin@pisti.com";
    
    // Zaten var mı kontrol et
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      console.log("Admin kullanıcısı zaten mevcut.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("123456", 10);

    const newAdmin = new User({
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin"
    });

    await newAdmin.save();
    console.log("✅ Admin kullanıcısı başarıyla oluşturuldu!");
    console.log("Email: admin@pisti.com");
    console.log("Şifre: 123456");
    console.log("Giriş yaptıktan sonra şifreni veritabanından değiştirebilirsin.");
    
    process.exit(0);
  } catch (error) {
    console.error("Hata oluştu:", error);
    process.exit(1);
  }
}

seed();
