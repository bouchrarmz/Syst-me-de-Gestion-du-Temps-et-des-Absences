#!/bin/bash

# Script pour tester le nouveau backend Laravel

# Créer la base de données
echo "Création de la base de données..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS ocp_time;"

# Exécuter les migrations
echo "Exécution des migrations..."
cd /home/ubuntu/project/new-backend
php artisan migrate:fresh

# Créer des données de test
echo "Création des données de test..."
php artisan db:seed

# Démarrer le serveur Laravel
echo "Démarrage du serveur Laravel..."
php artisan serve --host=0.0.0.0 --port=8000
