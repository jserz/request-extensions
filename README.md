# request-extensions

请求（axios、fetch）扩展，包括取消请求的扩展、锁定请求的扩展、缓存请求的扩展等。

## 功能

-   重复请求时，取消未完成的前请求
-   切换路由时，取消未完成的所有请求
-   锁定请求，防止重复提交请求
-   缓存请求数据

## 安装

```
yarn add request-extensions
```

## 示例

### axios

#### 扩展 axios

```js
// http.js
import axios from 'axios';
import { axiosExtensions } from 'request-extensions';
const {
    cancelableAxios,
    isCancel,
    lockableAxios,
    isRepeatSubmit,
    cacheableAxios,
} = axiosExtensions;

// 这个适配器，可以是自定义或用 axios 默认的
let adapter = axios.defaults.adapter;
// 使用不能重复提交请求扩展，如果重复提交，后一个提交请求不能发起
adapter = lockableAxios(adapter);
// 使用可以取消请求扩展，如果前一个请求没有完成，后一个请求又发起，则会取消前一个请求
adapter = cancelableAxios(adapter);
// 使用可缓存请求扩展，如果前一个请求已经完成，同时后一个请求和前一个请求参数相同，则可以取缓存数据
adapter = cacheableAxios(adapter, {
    // 缓存请求的过期间隔，单位毫秒，默认 2分钟（120000ms）
    cacheTimeout: 120000,
    // 获取数据之后是否需要缓存
    isNeedCache: res => {
        return res.success;
    },
    // 最多缓存的数据条数, 默认 50 条
    maxCahceNumber: 50,
});

const http = axios.create({ adapter });

export default function ajax(config) {
    const defaultConfig = {
        // 表示切换路由时，取消未完成的请求
        onlySwitchRouteCancelable: true,
    };
    return http({ ...defaultConfig, ...config })
        .then((res) => {
            return res.data;
        })
        .catch((error) => {
            if (isCancel(error)) {
                console.log('请求已经取消');
            }
            if (isRepeatSubmit(error)) {
                console.log('请不要重复提交请求');
            }
        });
}
```

#### 使用

-   可以取消的请求

```js
import ajax from './http.js'

// 可取消的查询请求
const queryData = data => {
    return ajax({
        url: '/api/query-data'
        method: 'get'
        params: data,
        // 表示可以取消请求，切换路由时，也会取消请求
        cancelable: true,
    });
}

queryData() // 当前请求会被取消

queryData()
```

-   切换路由时，取消未完成的请求

```js
import React from 'react';
import { Route, Switch, BrowserRouter } from 'dva/router';
import { axiosExtensions } from 'request-extensions';
import pageA from './pageA';
import pageB from './pageB';

const { cancelAllAxios } = axiosExtensions;
const commonRender = (Component) => {
    return ({ match, location, history }) => {
        // 切换路由时，取消未完成的请求
        cancelAllAxios();
        const params = (match || {}).params || {};
        return <Component params={params} route={match} location={location} history={history} />;
    };
};

class App extends React.PureComponent {
    render() {
        return (
            <BrowserRouter basename="/abc">
                <Switch>
                    <Route exact path="/a" key="/a" render={commonRender(pageA)} />
                    <Route exact path="/b" key="/b" render={commonRender(pageB)} />
                </Switch>
            </BrowserRouter>
        );
    }
}
```

-   不可重复提交的请求

```js
import ajax from './http.js'

// 不能重复的提交请求
const postData = data => {
    return ajax({
        url: '/api/post-data'
        method: 'post'
        data,
        // 表示不可重复提交
        lockable: true,
    });
}

postData({ a: 'xxx'} );

postData({ a: 'xxx'} ); // 当前请求不能发起

```

-   可缓存的请求

```js
import ajax from './http.js'

// 可缓存的查询请求
const getCity = data => {
    return ajax({
        url: '/api/get-city'
        method: 'get'
        params: data,
        // 表示可以缓存请求
        cacheable: true,
    });
}

getCity().then(() => {
    getCity(); // 当前请求会直接去缓存数据
})


```

### fetch

#### 扩展 fetch

```js
// fetch.js
import fetch from 'isomorphic-fetch';
import { fetchExtensions } from 'request-extensions';
const {
    cancelableFetch,
    isCancel,
    lockableFetch,
    isRepeatSubmit,
    cacheableFetch,
} = fetchExtensions;

// 这个适配器，可以是自定义或用 Fetch 默认的
let extFetch = fetch;
// 使用不能重复提交请求扩展，如果重复提交，后一个提交请求不能发起
extFetch = lockableFetch(extFetch);
// 使用可以取消请求扩展，如果前一个请求没有完成，后一个请求又发起，则会取消前一个请求
extFetch = cancelableFetch(extFetch);
// 使用可缓存请求扩展，如果前一个请求已经完成，同时后一个请求和前一个请求参数相同，则可以取缓存数据
extFetch = cacheableFetch(extFetch, {
    // 缓存请求的过期间隔，单位毫秒，默认 2分钟（120000ms）
    cacheTimeout: 120000,
    // 获取数据之后是否需要缓存
    isNeedCache: res => {
        return res.success;
    },
    // 最多缓存的数据条数, 默认 50 条
    maxCahceNumber: 50,
});

export default function customFech(url, config) {
    const defaultConfig = {
        // 表示切换路由时，取消未完成的请求
        onlySwitchRouteCancelable: true,
    };
    return extFetch(url, { ...defaultConfig, ...config })
        .then(async (res) => {
            // 为了让缓存数据能多次读出，需要复制响应数据
            if (res && res.clone) {
                res = res.clone();
            }
            let data = {};
            if (res.ok) {
                data = await res.json();
            }
            return data;
        })
        .catch((error) => {
            if (isCancel(error)) {
                console.log('请求已经取消');
            }
            if (isRepeatSubmit(error)) {
                console.log('请不要重复提交请求');
            }
        });
}
```

#### 使用

-   可以取消的请求

```js
import ajax from './fetch.js'

// 可取消的查询请求
const queryData = data => {
    return fetch('/api/query-data', {
        method: 'get'
        params: data,
        // 表示可以取消请求，切换路由时，也会取消请求
        cancelable: true,
    });
}


queryData() // 当前请求会被取消

queryData()
```

-   切换路由时，取消未完成的请求

```js
import React from 'react';
import { Route, Switch, BrowserRouter } from 'dva/router';
import { fetchExtensions } from 'request-extensions';
import pageA from './pageA';
import pageB from './pageB';

const { cancelAllFetch } = fetchExtensions;
const commonRender = (Component) => {
    return ({ match, location, history }) => {
        // 切换路由时，取消未完成的请求
        cancelAllFetch();
        const params = (match || {}).params || {};
        return <Component params={params} route={match} location={location} history={history} />;
    };
};

class App extends React.PureComponent {
    render() {
        return (
            <BrowserRouter basename="/abc">
                <Switch>
                    <Route exact path="/a" key="/a" render={commonRender(pageA)} />
                    <Route exact path="/b" key="/b" render={commonRender(pageB)} />
                </Switch>
            </BrowserRouter>
        );
    }
}
```

-   不可重复提交的请求

```js
import fetch from './fetch.js'

// 不能重复的提交请求
const postData = data => {
    return fetch('/api/post-data', {
        method: 'post'
        data,
        // 表示不可重复提交
        lockable: true,
    });
}

postData({ a: 'xxx'} );

postData({ a: 'xxx'} ); // 当前请求不能发起
```

-   可缓存的请求

```js
import fetch from './fetch.js'

// 可缓存的查询请求
const getCity = data => {
    return fetch('/api/get-city', {
        method: 'get'
        params: data,
        // 表示可以缓存请求
        cacheable: true,
    });
}

getCity().then(() => {
    getCity(); // 当前请求会直接去缓存数据
})
```

## request-extensions api

### axios extensions

#### 取消请求

-   cancelableAxios(axiosAdapter): 取消请求的扩展
-   cancelAllAxios(): 取消所有未完成的请求
-   isCancel(error): 判断该请求是否被取消，在 catch 中，通过 error 判断

#### 不能重复提交请求

-   lockableAxios(axiosAdapter): 不能重复提交请求的扩展
-   deleteLockedUrl(url): 手动删除请求，入列的提交请求需要使用
-   isRepeatSubmit(error): 判断该请求是否因为重复提交被阻止，在 catch 中，通过 error 判断

#### 缓存请求

-   cacheableAxios(axiosAdapter)：缓存请求的扩展
-   deleteCacheItem(url): 删除缓存项

### fetch extensions

#### 取消请求

-   cancelableFetch(fetch): 取消请求的扩展
-   cancelAllFetch(): 取消所有未完成的请求
-   isCancel(error): 判断该请求是否被取消，在 catch 中，通过 error 判断

#### 重复提交请求

-   lockableFetch(fetch): 不能重复提交请求的扩展
-   deleteLockedUrl(url): 手动删除请求，入列的提交请求需要使用
-   isRepeatSubmit(error): 判断该请求是否因为重复提交被阻止，在 catch 中，通过 error 判断

#### 缓存请求

-   cacheableFetch(fetch)：缓存请求的扩展
-   deleteCacheItem(url): 删除缓存项

## request-extensions config

```js

const requestExtensionsConfig = {
    // 是否可以取消请求，切换路由时也会取消未完成的请求
    cancelable: boolean,
    // 切换路由时，是否取消未完成的请求
    onlySwitchRouteCancelable: boolean,
    // 是否不能重复提交请求
    lockable: boolean,
    // lockable 为 true 时，该请求是否为入队列的提交请求（就是提交结果需要异步获取），如果是，则提交完成后需要手动删除请求
    isEnqueueSubmit: boolean
    // 是否可以缓存请求
    cacheable: boolean,
    // cacheable 为 true 时，是否强制更新缓存数据
    forceUpdate: boolean,
}

// axios
ajax({
    ...axios.config,
    ...requestExtensionsConfig,
})

// fetch
fetch(url, {
    ...fetch.config,
    ...requestExtensionsConfig,
})
```
