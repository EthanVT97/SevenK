import React from 'react';
import Layout from './components/Layout';
import Banner from './components/Banner';

const App = () => {
    return (
        <Layout>
            <Banner
                imageUrl="/images/bagan-temple.jpg"
                title="Welcome to SevenK"
            />
        </Layout>
    );
};

export default App; 