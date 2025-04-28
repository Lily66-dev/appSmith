export default {
	init: function() {
    // 初始化代码...
    const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...";
    
    // 将函数存储到appsmith.store，使其他地方可以访问
    storeValue("authToken", token, false);
    
    // 设置初始化函数到store
    storeValue("initAuthInterceptor", () => {
      return evalJs(`
        // ... 您的拦截代码 ...
        const originalFetch = self.fetch;
        
        self.fetch = function(resource, options = {}) {
          options = options || {};
          options.headers = options.headers || {};
          
          // 从store获取token
          const token = appsmith.store.authToken;
          
          if (token) {
            options.headers = {
              ...options.headers,
              'Authorization': 'Bearer ' + token
            };
          }
          
          return originalFetch(resource, options);
        };
        
        return "拦截器已成功安装";
      `);
    }, false);
    
    // 返回自己以支持链式调用
    return "拦截器初始化完成";
  }
}