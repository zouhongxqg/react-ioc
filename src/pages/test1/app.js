import React, { Component } from 'react';
import Ioc from '../../ioc';

import defaultConfig from '../../component/Test';
import './index.scss';

const ioc = new Ioc();

const mergetConfig = (defaultconfig, newConfig) => {
    for (let p in newConfig) {
        if (defaultconfig[p] && defaultconfig[p] instanceof Object) {
            mergetConfig(defaultconfig[p], newConfig[p]);
        } else {
            defaultconfig[p] = newConfig[p];
        }
    }
    return defaultconfig;
};

const newConfig = {
    page1: {
        $config: {
            appName: 'appName',
        }
    },
};

const config = mergetConfig(defaultConfig, newConfig);

const IComponents = ioc.register(config);

const Page1 = IComponents.page1.getComponent();

export default class Index extends Component {
    render() {
        return (
                <div>
                    <Page1 />
                </div>
        );
    }
}