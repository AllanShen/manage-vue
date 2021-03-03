import axios from 'axios'
import router from '../router/index.js';
import store from '@/store'
//import router from '../router.js'
import {tip, toLogin, to403Page} from './utils.js'



const errorHandle = (status, msg) => {
  switch (status) {
    case 400:
      tip(msg);
      break;
    
    case 401:
      if (router.currentRoute == 'Login') {
        //test
      } else {
        store.dispatch('auth/setAuth', {
          'token': '',
          'isLogin': false
        });
        tip('登入過期，請重新登入')
      setTimeout(() => {
        toLogin();
      },1000);
      }
      break;
    
    case 403:
      to403Page();
      break;
    
    case 404:
      tip(msg);
      break;
    
    default:
      console.log("resp沒有欄截到的錯誤：" + msg);
  }
}

// axios的實例
var instance = axios.create({
  baseURL: 'https://manage.smartweb.adsli.org/api/'
})

// request攔截器
instance.interceptors.request.use((config) => {
  const token = store.state.auth.token;
  console.log("auth=",store.state.auth);
  token && (config.headers.Authorization = 'Bearer ' + token);
  return config;
},(error) => {
  return Promise.reject(error);
});

instance.interceptors.response.use((response) => {
  console.log("axio response=",response)
  return response;
}, (error) => {
  const { response } = error;

  if (response) {
    errorHandle(response.status, response.data.error);
    return Promise.reject(error);
  } else {
    if (!window.navigator.onLine) {
      tip('網路出了點問題');
    } else {
      return Promise.reject(error);
    }
  }
})

export default function (method, url, data=null) {
  method = method.toLowerCase();
  console.log("method="+method);
  if (method == 'post') {
    return instance.post(url, data);
  } else if (method == 'get') {
    return instance.get(url, {params: data})
  } else if (method == 'delete') {
    return instance.delete(url, {params: data})
  } else if (method == 'put') {
    return instance.put(url, data)
  } else {
    console.error('未知的method'+method);
    return false;
  }

}