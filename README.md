# Toleka

> Le talent qu'il te faut, en un swipe.

Toleka met en relation des créateurs : publiez une **annonce flash** pour trouver un profil précis, ou **swipez** les annonces qui correspondent à votre talent et proposez votre collaboration.

## Fonctionnalités

- **Connexion Google** (Firebase Auth), seul moyen d'authentification
- **Profil** : domaine, talent / profession, compétences, ville, bio
- **Accueil** : cartes de flashs à swiper (glisser à droite pour proposer, à gauche pour passer), filtrées par défaut sur votre talent
- **Création d'un flash** : profil recherché, délai, rémunération
- **Tableau de bord** : demandes reçues (accepter / refuser, contact débloqué à l'acceptation), demandes envoyées, mes flashs
- Données en temps réel via **Cloud Firestore**

## Stack

Vite · React 19 · TypeScript · Firebase (Auth, Firestore, Analytics) · lucide-react

## Démarrage

```bash
npm install
cp .env.example .env   # puis renseigner les valeurs Firebase
npm run dev
```

L'application tourne sur http://localhost:5173.

## Firebase

L'initialisation est dans [`src/lib/firebase.ts`](src/lib/firebase.ts) ; la configuration est lue depuis les variables `VITE_FIREBASE_*` du fichier `.env` (non versionné, voir `.env.example`).

Dans la console Firebase :

1. **Authentication → Sign-in method** : activer le fournisseur **Google**.
2. **Firestore Database** : créer la base, puis publier les règles de [`firestore.rules`](firestore.rules).
3. **Authentication → Settings → Authorized domains** : ajouter le domaine de déploiement.

Sans connexion Google ou sans règles Firestore, l'application bascule en **mode démo local** (données sur l'appareil uniquement).

## Structure

```
src/
├── components/   Landing, SwipeDeck, Dashboard, CreateFlash, ProfileForm…
├── lib/          firebase.ts (init), db.ts (Firestore)
├── constants.ts  catégories, données de démo
└── types/        modèles TypeScript
```
