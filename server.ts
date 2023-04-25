import server from './src';

const port = process.env.PORT || 8888;
server.listen(port, () => {
    console.log('\x1b[44m', `Server Is On URL http://localhost:${port}`, '\x1b[0m');
})