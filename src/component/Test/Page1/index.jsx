import React, { useState, useEffect } from 'react';

import './index.scss';

export const useLogic = (config) => {
    const [showTitle, setShowTitle] = useState(false);

    useEffect(() => {}, []);

    return {showTitle};
};

const Page1 = (props) => {
    let config = props.config;
    return (
        <div className="test-page1">
            {props.showTitle ? <div>I am title</div> : null}
            <div>page1 hahah</div>
            <div>{config.appName}</div>
        </div>
    );
};

const IPage1 = ([], config) => () => {
    return <config.$view config={config} {...config.$logic(config)} />;
};

IPage1.$logic = useLogic;
IPage1.$view = Page1;

export default IPage1;