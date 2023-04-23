module.exports = {
    contracts_build_directory: './client/src/contracts',
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: 1337,
        }
    },
    compilers: {
        solc: {
            // yarn add solc后，找到路径填路径，不然那个下载不了很慢
            version: "./node_modules/solc",
        }
    }
};
