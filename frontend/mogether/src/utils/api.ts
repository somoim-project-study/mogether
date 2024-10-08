import axios from 'axios';
import { forgotPassword } from '../store/slices/authSlice';
import { access } from 'fs';
import { setAuthenticated } from '../store/slices/authSlice';
import { UseDispatch } from 'react-redux';

const API_BASE_URL = "https://api.mo-gether.site"; // 백엔드 서버의 기본 URL

// Axios 인스턴스 생성
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 -> 보낼 때 중간에 가로쳐서 토큰을 넣어줌
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['accessToken'] = `${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem('refreshToken');

    if (error.response.status === 401 && refreshToken) {  //refreshToken이 있을 때
      try {
        const response = await axios.get(`${API_BASE_URL}/token`, {
          headers: {
            'refreshToken': refreshToken,
          },
        });
        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;
        const newUserId = response.data.userId;

        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        localStorage.setItem('userId', newUserId); 
        originalRequest.headers['accessToken'] = `${newAccessToken}`;

        return axios(originalRequest);
      } catch (err) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userId');
          window.location.reload();  //새로고침
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

//content-type: multipart/form-data로 보내기 위한 설정
export const api2 = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// 요청 인터셉터 -> 보낼 때 중간에 가로쳐서 토큰을 넣어줌
api2.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['accessToken'] = `${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api2.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem('refreshToken');

    if (error.response.status === 401 && refreshToken) {  //refreshToken이 있을 때
      try {
        const response = await axios.get(`${API_BASE_URL}/token`, {
          headers: {
            'refreshToken': refreshToken,
          },
        });
        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;
        const newUserId = response.data.userId;

        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        localStorage.setIem('userId', newUserId); 
        originalRequest.headers['accessToken'] = `${newAccessToken}`;

        return axios(originalRequest);
      } catch (err) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userId');
          window.location.reload();  //새로고침
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// API 요청 함수들
export const loginApi = async (email: string, password: string) => {
  const response = await api.post('/login', { email: email, password: password });
  return response;  //api.ts에서 이미 localStorage에 accessToken, refreshToken을 저장했기 때문에 return response만 해주면 됨
};

export const forgotPasswordApi = async (email: string, nickname: string) => {
  const response = await api.post('/user/password', { email: email, nickname: nickname });
  return response;
}


export const registerApi = async (registerFormData: FormData) => {  //register 호출 시 registerFormData라는 객체 데이터를 받아옴
  const response = await api2.post('/user/join', registerFormData);
  return response;
};

export const socialRegisterApi = async (socialRegisterFormData: any) => {
  const response = await api2.post(`/user/${socialRegisterFormData.userId}/oauth2/info`, socialRegisterFormData.socialRegisterFormData);
  return response;
}

export const kakaoRegisterApi = async () => {
  const response = await api.get('https://api.mo-gether.site/oauth2/authorization/{kakao}');
  return response;
}

export const GoogleRegisterApi = async () => {
  const response = await api.get('https://api.mo-gether.site/oauth2/authorization/{Google}');
  return response;
}



// export const fetchUserProfileApi = async () => {
//     const response = await api.get('/user/profile');
//     return response;
//   };

export const fetchMoimApi = async () => {
  const response = await api.get('/moim');
  return response;
};

export const fetchBungaeApi = async () => {
  const response = await api.get('/bungae');
  return response;
};

export const createMoimApi = async (postData: FormData) => {
  const response = await api2.post('/moim', postData);
  return response;
};

export const createBungaeApi = async (postData: FormData) => {
  const response = await api2.post('/bungae', postData);
  return response;
}

export const MoimCardApi = async (moimId: number) => {
  const response = await api.get(`/moim/${moimId}`);
  return response;
};

export const BungaeCardApi = async (bungaeId: number) => {
  const response = await api.get(`/bungae/${bungaeId}`);
  return response;
}

export const deleteMoimCardApi = async (moimId: number) => {
  const response = await api.delete(`/moim/${moimId}`);
  return response;
}

export const deleteBungaeCardApi = async (bungaeId: number) => {
  const response = await api.delete(`/bungae/${bungaeId}`);
  return response;
}

export const interestMoimApi = async (interest: any) => {
  const response = await api.post(`/interest/moim/${interest.moimId}`, interest);
  return response;  // moim 관심 등록
}

export const interestMoimDeleteApi = async (interest: any) => {
  const response = await api.delete(`/interest/moim/${interest.moimId}`);
  return response;  // moim 관심 해제
}


export const interestBungaeApi = async (interest: any) => {
  const response = await api.post(`/interest/bungae/${interest.bungaeId}`, interest);
  return response;
}

export const interestBungaeDeleteApi = async (interest: any) => {
  const response = await api.delete(`/interest/bungae/${interest.bungae}`);
  return response;
}

//유저 정보 조회
export const userApi = async (userId: number) => {
  const response = await api.get(`/user/${userId}`);
  return response;
}

export const searchMoimApi = async (searchData: any) => {
  const response = await api.get(`/moim/search?name=${searchData.name}&city=${searchData.city}&gu=${searchData.gu}`);
  return response;
}

export const searchBungaeApi = async (searchData: any) => {  // any 형식은 대부분 객체 형식이라고 봐도 무방...
  const response = await api.get(`/bungae/search?name=${searchData.name}&city=${searchData.city}&gu=${searchData.gu}`);
  return response;
}

export const changePasswordApi = async (passwordData: {userId: number, oldPassword: string, newPassword: string}) => {
  const response = await api.patch(`/user/${passwordData.userId}/password`, { exPassword: passwordData.oldPassword, newPassword: passwordData.newPassword });
  return response;
};


export const logoutApi = async () => {
  const response = await api.post('/logout');
  return response;
}

export const MyCreateMoimListApi = async (userId: number) => {
  const response = await api.get(`/user/${userId}/host/moim`);
  return response;  //내가 등록한 모임 리스트
}

export const MyCreateBungaeListApi = async (userId: number) => {
  const response = await api.get(`/user/${userId}/host/bungae`);
  return response;
}

export const MoimInterestApi = async (userId: number) => {
  const response = await api.get(`/user/${userId}/interest/moim`);
  return response;   //내가 관심있다고 체크한 모임 리스트
}

export const BungaeInterestApi = async (userId: number) => {
  const response = await api.get(`/user/${userId}/interest/bungae`);
  return response;
}

export const joinMoimApi = async (join: any) => {
  const response = await api.post(`/moim/${join.moimId}/join`);
  return response;  //참여 신청
} 

export const joinQuitMoimApi = async (join: any) => {
  const response = await api.delete(`/moim/${join.moimId}/quit`);
  return response;
}

export const joinBungaeApi = async (join: any) => {
  const response = await api.post(`/bungae/${join.bungaeId}/join`);
  return response;
}

export const joinQuitBungaeApi = async (join: any) => {
  const response = await api.delete(`/bungae/${join.bungaeId}/quit`);
  return response;
}

export const changeUserProfile = async (profileData: any) => {
  const response = await api2.patch(`/user/${profileData.userId}`, profileData.patchData);
  return response;
}

export const EditMoimApi = async (moimId: number, editData: FormData) => {
  const response = await api2.patch(`/moim/${moimId}`, editData);
  return response;
}

export const EditBungaeApi = async (bungaeId: number, editData: FormData) => {
  const response = await api2.patch(`/bungae/${bungaeId}`, editData);
  return response;
}

export const DeleteUserApi = async (userId: number) => {
  const response = await api.delete(`/user/${userId}`);
  return response;
}

export const MoimUserKickOutApi = async (kickOut: any) => {
  const response = await api.post('/moim/kickout', {userId: kickOut.userId, moimId: kickOut.moimId});
  return response;
}

export const BungaeKickOutApi = async (kickOut: any) => {
  const response = await api.post('/bungae/kickout', {userId: kickOut.userId, bungaeId: kickOut.bungaeId});
  return response;
}

export const ChatListApi = async (userId: number) => {
  const response = await api.get(`/user/${userId}/chat`);
  return response;
}

export const ChatRoomApi = async (roomId: number) => {
  const response = await api.get(`/chat/room/${roomId}`);
  return response;
}





