pipeline {
    agent {
    docker {
        image 'mcr.microsoft.com/playwright:v1.58.0-noble'
        reuseNode true
        args '--dns 1.1.1.1 --dns 8.8.8.8'
    }
    }

    environment {
    NETLIFY_AUTH_TOKEN = credentials('NETLIFY_TOKEN')
    }
    stages {
        stage('Build') {
            when { branch 'master' }
            agent { 
                docker { 
                    image 'mcr.microsoft.com/playwright:v1.58.0-noble'
                    reuseNode true
                }
            }
            steps {
                sh 'rm -rf node_modules package-lock.json'
                sh 'npm install'
                sh 'npm run build'
            }
        }
        
        stage('Unit Tests') {
            agent { 
                docker { 
                    image 'mcr.microsoft.com/playwright:v1.58.0-noble'
                    reuseNode true
                }
            }
            steps {
                sh 'npm install'
                sh 'npm run test'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: false,
                        keepAll: true,
                        reportDir: 'html',
                        reportFiles: 'index.html',
                        reportName: 'VitestReport',
                        useWrapperFileDirectly: true
                    ])
                }
            }
        }
        
        stage('E2E Tests') {
            agent { 
                docker { 
                    image 'mcr.microsoft.com/playwright:v1.58.0-noble'
                    reuseNode true
                }
            }
            steps {
                sh 'npm install'
                sh 'npm run test:e2e'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: false,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'PlaywrightReport',
                        useWrapperFileDirectly: true
                    ])
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            agent any
            steps {
                sh 'echo "Déploiement en production sur main"'
            }
        }
        
        stage('Docker Build & Push') {
            when {
                branch 'main'
            }
            agent any
            environment {
                CI_REGISTRY = 'ghcr.io'
                CI_REGISTRY_USER = 'rwanish'
                CI_REGISTRY_IMAGE = "${CI_REGISTRY}/${CI_REGISTRY_USER}/chess"
                CI_REGISTRY_PASSWORD = credentials('CI_REGISTRY_PASSWORD')
            }
            steps {
                sh 'docker build --network=host -t $CI_REGISTRY_IMAGE .'
                sh 'echo $CI_REGISTRY_PASSWORD | docker login -u $CI_REGISTRY_USER --password-stdin $CI_REGISTRY'
                sh 'docker push $CI_REGISTRY_IMAGE'
            }
        }


    }
}