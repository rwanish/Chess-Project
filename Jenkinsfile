pipeline {
    agent none
    stages {
        stage('Build') {
            agent { 
                docker { 
                    image 'mcr.microsoft.com/playwright:v1.57.0-noble'
                }
            }
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        
        stage('Unit Tests') {
            agent { 
                docker { 
                    image 'mcr.microsoft.com/playwright:v1.57.0-noble'
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
                    image 'mcr.microsoft.com/playwright:v1.57.0-noble'
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
    }
}