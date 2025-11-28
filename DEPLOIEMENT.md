# 🚀 Guide de Déploiement - Chroniques de Valthera

> Déploiement sur VPS avec Nginx (reverse proxy) + PM2

---

## 📋 Prérequis

- VPS avec Ubuntu/Debian
- Node.js 18+ installé
- Nginx installé
- PM2 installé globalement (`npm install -g pm2`)
- Nom de domaine configuré : `valthera.sourcekod.fr`
- Certificat SSL (Let's Encrypt recommandé)

---

## 🔧 Configuration

### Port de l'application

> ⚠️ Les ports 3000 et 3001 sont déjà utilisés. Cette application utilisera le **port 3002**.

---

## 📦 Étape 1 : Préparation du serveur

### 1.1 Connexion au VPS

```bash
ssh user@votre-vps-ip
```

### 1.2 Créer le répertoire de l'application

```bash
sudo mkdir -p /var/www/chroniques-de-valthera
sudo chown -R $USER:$USER /var/www/chroniques-de-valthera
```

---

## 📤 Étape 2 : Déploiement du code

### Option A : Via Git (recommandé)

```bash
cd /var/www/chroniques-de-valthera
git clone https://github.com/s0urc3k0d/chroniques-de-valthera.git .
```

### Option B : Via SCP (depuis votre machine locale)

```bash
# Depuis votre machine locale
scp -r ./* user@votre-vps-ip:/var/www/chroniques-de-valthera/
```

---

## ⚙️ Étape 3 : Configuration de l'environnement

### 3.1 Installer les dépendances

```bash
cd /var/www/chroniques-de-valthera
npm install
```

### 3.2 Créer le fichier `.env.local`

```bash
nano .env.local
```

Contenu :

```env
# Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase

# Auth0 (si différent de la config par défaut)
VITE_AUTH0_DOMAIN=votre-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=votre_client_id
VITE_AUTH0_CALLBACK_URL=https://valthera.sourcekod.fr
```

### 3.3 Mettre à jour la configuration Auth0

Dans `services/auth0Config.ts`, vérifiez que les URLs de callback correspondent à votre domaine de production.

---

## 🏗️ Étape 4 : Build de production

```bash
cd /var/www/chroniques-de-valthera
npm run build
```

Cela génère le dossier `dist/` avec les fichiers statiques optimisés.

---

## 🖥️ Étape 5 : Configuration PM2

### 5.1 Créer le fichier de configuration PM2

```bash
nano /var/www/chroniques-de-valthera/ecosystem.config.cjs
```

Contenu :

```javascript
module.exports = {
  apps: [
    {
      name: 'chroniques-de-valthera',
      script: 'npx',
      args: 'vite preview --host 0.0.0.0 --port 3002',
      cwd: '/var/www/chroniques-de-valthera',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '/var/log/pm2/valthera-error.log',
      out_file: '/var/log/pm2/valthera-out.log',
      time: true
    }
  ]
};
```

### 5.2 Alternative : Servir avec un serveur statique (recommandé pour la prod)

Pour une meilleure performance, utilisez `serve` au lieu de `vite preview` :

```bash
npm install -g serve
```

Puis modifiez `ecosystem.config.cjs` :

```javascript
module.exports = {
  apps: [
    {
      name: 'chroniques-de-valthera',
      script: 'serve',
      args: '-s dist -l 3002',
      cwd: '/var/www/chroniques-de-valthera',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/pm2/valthera-error.log',
      out_file: '/var/log/pm2/valthera-out.log',
      time: true
    }
  ]
};
```

### 5.3 Créer le répertoire de logs

```bash
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2
```

### 5.4 Démarrer l'application avec PM2

```bash
cd /var/www/chroniques-de-valthera
pm2 start ecosystem.config.cjs
```

### 5.5 Sauvegarder la configuration PM2

```bash
pm2 save
pm2 startup
```

Suivez les instructions affichées pour configurer le démarrage automatique.

---

## 🌐 Étape 6 : Configuration Nginx

### 6.1 Créer la configuration du site

```bash
sudo nano /etc/nginx/sites-available/chroniques-de-valthera
```

Contenu :

```nginx
server {
    listen 80;
    server_name valthera.sourcekod.fr www.valthera.sourcekod.fr;

    # Redirection HTTPS
    return 301 https://valthera.sourcekod.fr$request_uri;
}

server {
    listen 443 ssl http2;
    server_name valthera.sourcekod.fr www.valthera.sourcekod.fr;

    # Certificats SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/valthera.sourcekod.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/valthera.sourcekod.fr/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Logs
    access_log /var/log/nginx/valthera-access.log;
    error_log /var/log/nginx/valthera-error.log;

    # Taille max upload (pour les images)
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    gzip_comp_level 6;

    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Cache des assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Reverse proxy vers PM2
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 6.2 Activer le site

```bash
sudo ln -s /etc/nginx/sites-available/chroniques-de-valthera /etc/nginx/sites-enabled/
```

### 6.3 Tester la configuration Nginx

```bash
sudo nginx -t
```

### 6.4 Recharger Nginx

```bash
sudo systemctl reload nginx
```

---

## 🔒 Étape 7 : Certificat SSL (Let's Encrypt)

### 7.1 Installer Certbot (si pas déjà fait)

```bash
sudo apt install certbot python3-certbot-nginx
```

### 7.2 Générer le certificat

```bash
sudo certbot --nginx -d valthera.sourcekod.fr -d www.valthera.sourcekod.fr
```

### 7.3 Renouvellement automatique (vérifier)

```bash
sudo certbot renew --dry-run
```

---

## ✅ Étape 8 : Vérifications finales

### 8.1 Vérifier que PM2 tourne

```bash
pm2 status
pm2 logs chroniques-de-valthera
```

### 8.2 Vérifier le port

```bash
sudo netstat -tlnp | grep 3002
# ou
sudo ss -tlnp | grep 3002
```

### 8.3 Tester l'accès

```bash
curl -I http://127.0.0.1:3002
curl -I https://valthera.sourcekod.fr
curl -I https://www.valthera.sourcekod.fr
```

---

## 🔄 Mise à jour de l'application

Script de mise à jour rapide :

```bash
#!/bin/bash
# update-valthera.sh

cd /var/www/chroniques-de-valthera

echo "📥 Pull des dernières modifications..."
git pull origin main

echo "📦 Installation des dépendances..."
npm install

echo "🏗️ Build de production..."
npm run build

echo "🔄 Redémarrage de PM2..."
pm2 restart chroniques-de-valthera

echo "✅ Mise à jour terminée !"
```

Rendre exécutable :

```bash
chmod +x update-valthera.sh
```

---

## 🛠️ Commandes utiles

| Commande | Description |
|----------|-------------|
| `pm2 status` | Voir l'état des applications |
| `pm2 logs chroniques-de-valthera` | Voir les logs en temps réel |
| `pm2 restart chroniques-de-valthera` | Redémarrer l'app |
| `pm2 stop chroniques-de-valthera` | Arrêter l'app |
| `pm2 delete chroniques-de-valthera` | Supprimer de PM2 |
| `pm2 monit` | Monitoring interactif |
| `sudo systemctl status nginx` | État de Nginx |
| `sudo tail -f /var/log/nginx/valthera-error.log` | Logs Nginx |

---

## 🔐 Configuration Auth0 pour la production

N'oubliez pas de mettre à jour les URLs dans votre dashboard Auth0 :

1. **Allowed Callback URLs** : `https://valthera.sourcekod.fr, https://www.valthera.sourcekod.fr`
2. **Allowed Logout URLs** : `https://valthera.sourcekod.fr, https://www.valthera.sourcekod.fr`
3. **Allowed Web Origins** : `https://valthera.sourcekod.fr, https://www.valthera.sourcekod.fr`

---

## 📊 Récapitulatif

| Élément | Valeur |
|---------|--------|
| **Port application** | 3002 |
| **Répertoire** | `/var/www/chroniques-de-valthera` |
| **Process PM2** | `chroniques-de-valthera` |
| **Logs PM2** | `/var/log/pm2/valthera-*.log` |
| **Config Nginx** | `/etc/nginx/sites-available/chroniques-de-valthera` |
| **Logs Nginx** | `/var/log/nginx/valthera-*.log` |

---

## 🆘 Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs
pm2 logs chroniques-de-valthera --lines 50

# Vérifier si le port est libre
sudo lsof -i :3002
```

### Erreur 502 Bad Gateway

```bash
# Vérifier que PM2 tourne
pm2 status

# Redémarrer si nécessaire
pm2 restart chroniques-de-valthera
```

### Erreur de certificat SSL

```bash
# Renouveler le certificat
sudo certbot renew

# Recharger Nginx
sudo systemctl reload nginx
```

---

**Bonne mise en production ! 🎲🏰**
