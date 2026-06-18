# Expert Évaluateur d'Impact — Déploiement sécurisé

Ce dossier contient tout pour déployer l'agent **en ligne et fonctionnel**, avec la clé API gardée **côté serveur** (jamais dans le navigateur).

```
deploy/
├─ index.html      ← le frontend (l'interface de l'agent, fichier autonome)
├─ api/chat.js     ← le backend sécurisé (garde la clé API, relaie vers Anthropic)
├─ vercel.json     ← configuration de l'hébergement
└─ README.md       ← ce guide
```

## Comment ça marche (sécurité)

- Le navigateur envoie la conversation à `/api/chat`.
- `api/chat.js` ajoute la clé API (lue dans une **variable d'environnement** du serveur) et appelle Anthropic.
- **La clé n'apparaît jamais dans le code envoyé au navigateur.** C'est le point clé : ne mettez **jamais** une clé API directement dans `index.html`.
- Ouvert en local (double-clic) sans backend, `index.html` affiche l'interface mais l'agent répond « moteur indisponible » — c'est normal, c'est la démo hors-ligne.

---

## Déploiement sur Vercel (recommandé, gratuit, ~5 min)

### 1. Obtenir une clé API Anthropic
1. Créez un compte sur **console.anthropic.com**.
2. Ajoutez un moyen de paiement (l'usage est facturé à la consommation, quelques centimes pour des tests).
3. Allez dans **API Keys → Create Key**, copiez la clé (commence par `sk-ant-...`).

### 2. Déployer
**Option A — sans rien installer (glisser-déposer)**
1. Compressez ce dossier `deploy/` en `.zip`.
2. Sur **vercel.com**, créez un compte, puis **Add New → Project → Deploy** et déposez le dossier (ou importez-le).

**Option B — en ligne de commande**
```bash
npm i -g vercel
cd deploy
vercel
```

### 3. Ajouter la clé API (l'étape sécurité)
Dans Vercel : **votre projet → Settings → Environment Variables**, ajoutez :

| Name                  | Value                          |
|-----------------------|--------------------------------|
| `ANTHROPIC_API_KEY`   | votre clé `sk-ant-...`         |
| `MODEL` *(optionnel)* | `claude-haiku-4-5`             |

Puis **redéployez** (Deployments → ⋯ → Redeploy) pour que la variable soit prise en compte.

### 4. Tester
Ouvrez l'URL fournie par Vercel (ex. `https://votre-projet.vercel.app`). L'agent doit répondre.

---

## Netlify (alternative)
Le backend doit être une **Netlify Function**. Déplacez `api/chat.js` vers `netlify/functions/chat.js`, adaptez l'export (`exports.handler = async (event) => { ... }` au lieu de `export default`), et le frontend appellera `/.netlify/functions/chat`. Dites-le moi et je vous fournis la version Netlify clé en main.

## Cloudflare Workers (alternative)
Même principe : un Worker détient la clé (via `wrangler secret put ANTHROPIC_API_KEY`) et relaie vers Anthropic. Version dédiée disponible sur demande.

---

## Notes
- **Modèle** : si l'identifiant de modèle renvoie une erreur, changez la variable `MODEL` (ex. `claude-3-5-haiku-latest` ou `claude-sonnet-4-5`) sans toucher au code.
- **Coûts** : chaque réponse consomme des tokens facturés sur votre compte Anthropic. Pensez à fixer une limite de dépense dans la console.
- **Autre fournisseur** (OpenAI, Azure OpenAI…) : l'architecture est identique ; seul `api/chat.js` change. Demandez-moi la variante voulue.
- **Limiter l'accès** : pour éviter que n'importe qui utilise votre clé via votre URL publique, ajoutez une protection (mot de passe Vercel, ou un en-tête secret vérifié dans `api/chat.js`). Je peux l'ajouter si besoin.
