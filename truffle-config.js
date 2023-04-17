module.exports = {
    contracts_build_directory: './client/src/contracts',
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: 1337,
        },
    },
    compilers: {
        solc: {
            // yarn add solc
            version: "C:\\Users\\Administrator\\Desktop\\power\\node_modules\\solc",
        }
    }
};