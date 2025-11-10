# Guide de Sécurité - L'Économe Pitmaster

## ⚠️ Avertissement Important

**Les clés API sont actuellement stockées côté client et exposées dans le navigateur.**
Cette configuration est adaptée pour le développement et les démonstrations, mais **NE DOIT PAS être utilisée en production**.

## 🔒 Meilleures Pratiques de Sécurité

### 1. Protection des Clés API

#### Configuration Actuelle (Développement uniquement)

Les clés API sont configurées via des variables d'environnement Vite :

```bash
# Créez un fichier .env à la racine du projet
cp .env.example .env

# Ajoutez vos clés API
VITE_GEMINI_API_KEY=votre_clé_gemini
VITE_OPENAI_API_KEY=votre_clé_openai
VITE_ANTHROPIC_API_KEY=votre_clé_anthropic
```

⚠️ **Limitations** :
- Les clés sont visibles dans le code source du navigateur
- Risque d'abus si l'application est exposée publiquement
- Pas de rate limiting côté serveur

#### Configuration Production Recommandée

Pour la production, **vous devez implémenter un backend proxy** :

```
Client (Browser) → Backend API → AI Provider API
                   ↑
              Clés API sécurisées
              + Rate limiting
              + Authentification
```

Exemple d'architecture backend :

```javascript
// server/routes/ai.js
app.post('/api/ai/suggestions', authenticateUser, async (req, res) => {
  // Vérifier l'authentification et les permissions
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  // Rate limiting par utilisateur
  const rateLimitOk = await checkRateLimit(req.user.id);
  if (!rateLimitOk) return res.status(429).json({ error: 'Too many requests' });

  // Appeler l'API AI avec la clé sécurisée côté serveur
  const apiKey = process.env.GEMINI_API_KEY; // Jamais exposé au client
  const result = await callGeminiAPI(req.body, apiKey);

  res.json(result);
});
```

### 2. Variables d'Environnement

**Ne jamais commiter le fichier `.env`**

Le fichier `.gitignore` inclut déjà :
```
.env
.env.local
.env.*.local
```

**Toujours utiliser `.env.example`** pour documenter les variables nécessaires sans exposer les valeurs réelles.

### 3. Rotation des Clés API

- **Changez régulièrement vos clés API** (mensuellement recommandé)
- **Révoquez immédiatement** une clé si elle est compromise
- **Utilisez des clés différentes** pour dev/staging/production

### 4. Limites d'Utilisation

Configurez des limites sur vos comptes AI :

- **Google Gemini** : https://aistudio.google.com/app/apikey (Budget limits)
- **OpenAI** : https://platform.openai.com/account/limits (Usage limits)
- **Anthropic** : https://console.anthropic.com/settings/limits (Billing limits)

### 5. Monitoring et Alertes

- Configurez des alertes de consommation sur chaque plateforme
- Surveillez les pics d'utilisation inhabituels
- Loggez tous les appels API pour audit

## 🛡️ Checklist de Sécurité

### Avant de Déployer en Production

- [ ] Implémenter un backend pour proxy des appels AI
- [ ] Ajouter une authentification utilisateur (JWT, OAuth)
- [ ] Mettre en place un rate limiting
- [ ] Configurer HTTPS/SSL
- [ ] Activer CORS de manière restrictive
- [ ] Mettre en place des logs et monitoring
- [ ] Configurer des alertes de sécurité
- [ ] Effectuer un audit de sécurité
- [ ] Tester la résilience aux attaques courantes (OWASP Top 10)
- [ ] Documenter le plan de réponse aux incidents

### Protection contre les Vulnérabilités Courantes

#### XSS (Cross-Site Scripting)
✅ React échappe automatiquement les contenus
⚠️ Attention avec `dangerouslySetInnerHTML` (non utilisé actuellement)

#### SQL Injection
✅ N/A (pas de base de données actuellement)
🔜 Utiliser un ORM (Prisma, TypeORM) pour le backend futur

#### CSRF (Cross-Site Request Forgery)
🔜 Implémenter des tokens CSRF pour le backend

#### Rate Limiting
❌ Non implémenté côté client
🔜 À implémenter côté backend

## 📚 Ressources Additionnelles

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google AI Studio Security](https://ai.google.dev/gemini-api/docs/api-key)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)
- [Anthropic Safety Guidelines](https://docs.anthropic.com/claude/docs/safety-and-ethics)

## 🚨 Signalement de Vulnérabilités

Si vous découvrez une vulnérabilité de sécurité, veuillez **NE PAS** créer une issue publique.
Contactez directement le mainteneur du projet.

---

**Dernière mise à jour** : 2025-11-10
