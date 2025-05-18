# Système de Gestion du Temps et des Absences

Ce projet est une application complète de gestion du temps de travail et des absences pour les entreprises. Il permet aux employés de pointer leurs heures de travail et de gérer leurs demandes d'absence, tandis que les administrateurs peuvent superviser les équipes, approuver les demandes et générer des rapports.

## Architecture du Projet

Le projet est structuré selon une architecture moderne avec séparation claire entre le backend et le frontend :

### Backend (Laravel/PHP)

Le backend est développé avec Laravel, un framework PHP robuste et élégant. Il fournit une API RESTful sécurisée qui gère l'authentification, les autorisations et toutes les opérations de données. Le système utilise Sanctum pour l'authentification par jetons, offrant une sécurité optimale pour les communications entre le frontend et le backend.

Les principales fonctionnalités du backend incluent :
- Authentification et gestion des utilisateurs
- Gestion des départements et des équipes
- Enregistrement et suivi du temps de travail
- Gestion des demandes d'absence avec workflow d'approbation
- Système de notifications pour les événements importants
- Statistiques et rapports sur le temps de travail

### Frontend (React/TypeScript)

Le frontend est construit avec React et TypeScript, utilisant Vite comme outil de build. L'interface utilisateur est développée avec shadcn-ui et Tailwind CSS pour un design moderne et responsive. L'application offre des tableaux de bord distincts pour les employés et les administrateurs, avec des fonctionnalités adaptées à chaque rôle.

Les principales sections du frontend comprennent :
- Tableau de bord employé pour le pointage et les demandes d'absence
- Tableau de bord administrateur pour la supervision et l'approbation
- Visualisations et graphiques pour l'analyse des données
- Interface multilingue (français, anglais, arabe)
- Design responsive pour une utilisation sur tous les appareils

## Prérequis

Pour exécuter ce projet localement, vous aurez besoin des éléments suivants :

### Pour le Backend
- PHP 8.1 ou supérieur
- Composer
- MySQL 5.7 ou supérieur
- Extension PHP nécessaires : BCMath, Ctype, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML

### Pour le Frontend
- Node.js 16 ou supérieur
- NPM ou Bun (le projet inclut un fichier de verrouillage pour les deux)

## Installation

### Configuration du Backend

1. Clonez ce dépôt sur votre machine locale.

2. Naviguez vers le dossier backend :
   ```
   cd final/backend
   ```

3. Installez les dépendances PHP :
   ```
   composer install
   ```

4. Créez un fichier .env en copiant le fichier .env.example :
   ```
   cp .env.example .env
   ```

5. Configurez votre base de données dans le fichier .env :
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=ocp_time
   DB_USERNAME=votre_utilisateur
   DB_PASSWORD=votre_mot_de_passe
   ```

6. Générez une clé d'application :
   ```
   php artisan key:generate
   ```

7. Exécutez les migrations pour créer les tables de la base de données :
   ```
   php artisan migrate
   ```

8. Optionnellement, remplissez la base de données avec des données de test :
   ```
   php artisan db:seed
   ```

9. Démarrez le serveur de développement :
   ```
   php artisan serve
   ```

Le backend sera accessible à l'adresse http://localhost:8000.

### Configuration du Frontend

1. Naviguez vers le dossier frontend :
   ```
   cd ../frontend
   ```

2. Installez les dépendances JavaScript :
   ```
   npm install
   ```
   ou si vous préférez utiliser Bun :
   ```
   bun install
   ```

3. Configurez l'URL du backend dans le fichier src/config/backend.js si nécessaire.

4. Démarrez le serveur de développement :
   ```
   npm run dev
   ```
   ou avec Bun :
   ```
   bun run dev
   ```

Le frontend sera accessible à l'adresse http://localhost:5173.

## Structure du Projet

### Backend (Laravel)

Le backend suit l'architecture MVC de Laravel avec les dossiers principaux suivants :

- `app/Http/Controllers/API` : Contrôleurs pour les endpoints de l'API
- `app/Models` : Modèles Eloquent pour l'interaction avec la base de données
- `database/migrations` : Migrations pour la structure de la base de données
- `routes/api.php` : Définition des routes de l'API
- `config` : Fichiers de configuration

Les principales routes API incluent :
- `/api/login` et `/api/logout` pour l'authentification
- `/api/users` pour la gestion des utilisateurs
- `/api/departments` pour la gestion des départements
- `/api/time-entries` pour l'enregistrement du temps
- `/api/absences` pour la gestion des absences
- `/api/notifications` pour le système de notifications

### Frontend (React)

Le frontend est organisé selon une architecture modulaire :

- `src/components` : Composants réutilisables
  - `admin` : Composants spécifiques aux administrateurs
  - `employee` : Composants spécifiques aux employés
  - `common` : Composants partagés
  - `ui` : Composants d'interface utilisateur
  - `charts` : Visualisations et graphiques
- `src/pages` : Pages principales de l'application
- `src/contexts` : Contextes React pour la gestion de l'état global
- `src/hooks` : Hooks personnalisés pour la logique réutilisable
- `src/services` : Services pour les appels API
- `src/i18n` : Configuration et fichiers de traduction

## Déploiement

### Backend

Pour déployer le backend en production :

1. Configurez votre serveur web (Apache, Nginx) pour pointer vers le dossier `public` du backend.
2. Assurez-vous que les permissions sont correctement définies.
3. Configurez le fichier `.env` avec les paramètres de production appropriés.
4. Exécutez `composer install --optimize-autoloader --no-dev` pour optimiser l'autoloader.
5. Générez la clé d'application si ce n'est pas déjà fait : `php artisan key:generate`.
6. Exécutez les migrations : `php artisan migrate --force`.
7. Optimisez la configuration : `php artisan config:cache`.
8. Optimisez les routes : `php artisan route:cache`.

### Frontend

Pour le frontend, plusieurs options sont disponibles :



2. **Déploiement manuel** :
   - Construisez l'application : `npm run build`
   - Déployez le contenu du dossier `dist` sur votre serveur web

## Fonctionnalités Principales

### Pour les Employés
- Pointage d'entrée et de sortie
- Visualisation des heures travaillées
- Demandes d'absence avec suivi du statut
- Notifications pour les approbations ou rejets
- Tableau de bord personnel avec statistiques

### Pour les Administrateurs
- Supervision des équipes et départements
- Approbation ou rejet des demandes d'absence
- Génération de rapports sur le temps de travail
- Gestion des utilisateurs et des permissions
- Statistiques et analyses avancées

## Personnalisation

Le projet est conçu pour être facilement personnalisable :

- Le backend peut être étendu avec de nouveaux contrôleurs et modèles pour des fonctionnalités supplémentaires.
- Le frontend utilise Tailwind CSS et shadcn-ui, permettant une personnalisation facile du design.
- Le système de traduction permet d'ajouter facilement de nouvelles langues en créant des fichiers JSON dans le dossier `src/i18n/locales`.

## Contribution

Les contributions à ce projet sont les bienvenues. Pour contribuer :

1. Forkez le dépôt
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Ajout d'une fonctionnalité incroyable'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est distribué sous licence MIT. Voir le fichier `LICENSE` pour plus d'informations.

## Contact

Pour toute question ou suggestion concernant ce projet, n'hésitez pas à ouvrir une issue sur ce dépôt GitHub.
