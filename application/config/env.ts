

const ENV = {
  development: {
    apiUrl: 'http://10.73.23.19:5000/api', 
    env: 'development',
    enableLogging: true,
    enableDebugMode: true,
  },
  preview: {
    apiUrl: 'https://bethel-ag-qvtu.onrender.com/api', 
    env: 'preview',
    enableLogging: true,
    enableDebugMode: false,
  },
  production: {
    apiUrl: 'https://bethel-ag-qvtu.onrender.com/api', 
    env: 'production',
    enableLogging: false,
    enableDebugMode: false,
  },
};


const currentEnv = process.env.EXPO_PUBLIC_ENV || 'development';

export const config = ENV[currentEnv as keyof typeof ENV] || ENV.development;

export default config;
