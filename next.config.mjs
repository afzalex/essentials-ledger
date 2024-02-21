/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
    output: 'export',
    basePath: isProd ? '/essentials-ledger' : '',
    assetPrefix: isProd ? '/essentials-ledger' : '',
};

export default nextConfig;
