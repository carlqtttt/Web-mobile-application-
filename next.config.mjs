/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle React Native Web
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
    }
    
    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ]

    // Handle expo modules
    config.resolve.alias['@expo/vector-icons'] = '@expo/vector-icons/build/vendor-react-native-vector-icons'
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
  },
  transpilePackages: [
    'react-native',
    'react-native-web',
    '@expo/vector-icons',
    'expo',
    'expo-image-picker',
    'expo-status-bar',
    '@react-navigation/native',
    '@react-navigation/stack',
    '@react-navigation/bottom-tabs',
    'react-native-screens',
    'react-native-safe-area-context',
    'react-native-gesture-handler',
    'react-native-svg'
  ],
}

export default nextConfig
