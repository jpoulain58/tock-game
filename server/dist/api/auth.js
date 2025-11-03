"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../utils/prisma");
const jwt_1 = require("../utils/jwt");
const email_1 = require("../utils/email");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, username, email, password } = req.body;
        if (!firstName || !lastName || !username || !email || !password) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
        }
        const existingUser = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });
        if (existingUser) {
            return res.status(409).json({
                error: existingUser.email === email
                    ? 'Cet email est déjà utilisé'
                    : 'Ce nom d\'utilisateur est déjà pris'
            });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                firstName,
                lastName,
                username,
                email,
                passwordHash,
            },
        });
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        await prisma_1.prisma.emailVerification.create({
            data: {
                userId: user.id,
                token: verificationToken,
                expiresAt,
            },
        });
        await (0, email_1.sendVerificationEmail)(user.email, user.username, verificationToken);
        res.status(201).json({
            message: 'Inscription réussie ! Vérifiez votre email pour activer votre compte.',
            userId: user.id,
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { login, password } = req.body;
        if (!login || !password) {
            return res.status(400).json({ error: 'Email/username et mot de passe requis' });
        }
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [{ email: login }, { username: login }],
            },
        });
        if (!user) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }
        if (!user.isVerified) {
            return res.status(403).json({
                error: 'Veuillez vérifier votre email avant de vous connecter',
                needsVerification: true
            });
        }
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            username: user.username,
        });
        res.json({
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
    }
});
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ error: 'Token manquant' });
        }
        const verification = await prisma_1.prisma.emailVerification.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!verification) {
            return res.status(404).json({ error: 'Token invalide' });
        }
        if (verification.used) {
            return res.status(400).json({ error: 'Ce token a déjà été utilisé' });
        }
        if (new Date() > verification.expiresAt) {
            return res.status(400).json({ error: 'Ce token a expiré' });
        }
        await prisma_1.prisma.user.update({
            where: { id: verification.userId },
            data: { isVerified: true },
        });
        await prisma_1.prisma.emailVerification.update({
            where: { id: verification.id },
            data: { used: true },
        });
        res.json({
            message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.',
            username: verification.user.username
        });
    }
    catch (error) {
        console.error('Erreur lors de la vérification:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la vérification' });
    }
});
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token manquant' });
        }
        const token = authHeader.substring(7);
        const payload = (0, jwt_1.verifyToken)(token);
        if (!payload) {
            return res.status(401).json({ error: 'Token invalide' });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                email: true,
                isVerified: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email requis' });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        if (user.isVerified) {
            return res.status(400).json({ error: 'Cet email est déjà vérifié' });
        }
        await prisma_1.prisma.emailVerification.deleteMany({
            where: { userId: user.id, used: false },
        });
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        await prisma_1.prisma.emailVerification.create({
            data: {
                userId: user.id,
                token: verificationToken,
                expiresAt,
            },
        });
        await (0, email_1.sendVerificationEmail)(user.email, user.username, verificationToken);
        res.json({ message: 'Email de vérification renvoyé' });
    }
    catch (error) {
        console.error('Erreur lors du renvoi:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
exports.default = router;
