
// API Configuration
const API_BASE_URL = window.GMTheeVN_API_BASE_URL || 'http://localhost:5000/api';
const API_UPLOAD_URL = API_BASE_URL.replace('/api', '/uploads');

class APIClient {
  // =============================
  // Core helpers
  // =============================
  static get baseURL() {
    return window.GMTheeVN_API_BASE_URL || API_BASE_URL;
  }

  static setBaseURL(url) {
    window.GMTheeVN_API_BASE_URL = String(url || '').replace(/\/$/, '');
  }

  static getToken() {
    return localStorage.getItem('token');
  }

  static setToken(token) {
    if (token) localStorage.setItem('token', token);
  }

  static removeToken() {
    localStorage.removeItem('token');
  }

  static getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (_) {
      return null;
    }
  }

  static setCurrentUser(user) {
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }

  static clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  static isLoggedIn() {
    return Boolean(this.getToken());
  }

  static getRole() {
    return this.getCurrentUser()?.role || null;
  }

  static buildQuery(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== undefined && item !== null && item !== '') query.append(key, item);
        });
      } else {
        query.append(key, value);
      }
    });

    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
  }

  static getImageUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path;

    const cleanPath = String(path).replace(/^\/+/, '');
    if (cleanPath.startsWith('uploads/')) {
      return API_BASE_URL.replace('/api', `/${cleanPath}`);
    }

    return `${API_UPLOAD_URL}/${cleanPath}`;
  }

  static formatVND(value) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  }

  static async request(method, endpoint, data = null, options = {}) {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers = { ...(options.headers || {}) };
    const token = this.getToken();
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

    if (!isFormData) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    const fetchOptions = {
      method,
      headers,
      ...options
    };

    if (data !== null && data !== undefined) {
      fetchOptions.body = isFormData ? data : JSON.stringify(data);
    }

    try {
      const response = await fetch(url, fetchOptions);
      const text = await response.text();
      let result = null;

      try {
        result = text ? JSON.parse(text) : null;
      } catch (_) {
        result = { success: response.ok, message: text };
      }

      if (!response.ok || result?.success === false) {
        const message = result?.message || `HTTP error! status: ${response.status}`;
        const error = new Error(message);
        error.status = response.status;
        error.details = result?.details || null;
        error.response = result;
        throw error;
      }

      return result;
    } catch (error) {
      console.error('API Error:', error.message || error);
      throw error;
    }
  }

  static async getData(method, endpoint, data = null, options = {}) {
    const result = await this.request(method, endpoint, data, options);
    return result?.data;
  }

  static normalizeId(id) {
    return Number(id);
  }

  // =============================
  // Auth operations
  // =============================
  static async register(data) {
    // Backend can nhan: username, email, phone, password, confirmPassword
    return this.request('POST', '/auth/register', data);
  }

  static async login(emailOrData, password = null) {
    const payload = typeof emailOrData === 'object'
      ? emailOrData
      : { email: emailOrData, password };

    const result = await this.request('POST', '/auth/login', payload);

    if (result?.data?.token) this.setToken(result.data.token);
    if (result?.data?.user) this.setCurrentUser(result.data.user);

    return result;
  }

  static logout(redirectUrl = null) {
    this.clearAuth();
    if (redirectUrl) window.location.href = redirectUrl;
  }

  static async me() {
    const result = await this.request('GET', '/auth/me');
    if (result?.data) this.setCurrentUser(result.data);
    return result;
  }

  // =============================
  // Home operations
  // =============================
  static getHome() {
    return this.request('GET', '/home');
  }

  static getHomeData() {
    return this.getData('GET', '/home');
  }

  // =============================
  // Public artist operations
  // =============================
  static getArtists(filters = {}) {
    return this.request('GET', `/artists${this.buildQuery(filters)}`);
  }

  static getArtist(id) {
    return this.request('GET', `/artists/${id}`);
  }

  static getArtistDetail(id) {
    return this.getArtist(id);
  }

  // =============================
  // Public product operations
  // =============================
  static getProducts(filters = {}) {
    return this.request('GET', `/products${this.buildQuery(filters)}`);
  }

  static getProduct(id) {
    return this.request('GET', `/products/${id}`);
  }

  static getProductDetail(id) {
    return this.getProduct(id);
  }

  // =============================
  // Cart operations
  // =============================
  static getCart() {
    return this.request('GET', '/cart');
  }

  static addToCart(productId, quantity = 1) {
    // Backend dung endpoint /cart/add va field product_id
    return this.request('POST', '/cart/add', {
      product_id: this.normalizeId(productId),
      quantity: Number(quantity || 1)
    });
  }

  static updateCartItem(itemId, quantity) {
    return this.request('PUT', `/cart/items/${itemId}`, {
      quantity: Number(quantity)
    });
  }

  static removeFromCart(itemId) {
    return this.request('DELETE', `/cart/items/${itemId}`);
  }

  static deleteCartItem(itemId) {
    return this.removeFromCart(itemId);
  }

  static selectCartItem(itemId, isSelected) {
    return this.request('PATCH', `/cart/items/${itemId}/select`, {
      is_selected: Boolean(isSelected)
    });
  }

  static selectAllCart(isSelected) {
    return this.request('PATCH', '/cart/select-all', {
      is_selected: Boolean(isSelected)
    });
  }

  static async getCartCount() {
    const result = await this.getCart();
    return Number(result?.data?.summary?.totalQuantity || 0);
  }

  // =============================
  // User order operations
  // =============================
  static checkout(orderData = {}) {
    const payload = {
      cart_item_ids: orderData.cart_item_ids || orderData.cartItemIds || [],
      shipping_fee: orderData.shipping_fee ?? orderData.shippingFee ?? 25000,
      note: orderData.note || null
    };

    return this.request('POST', '/orders/checkout', payload);
  }

  static getOrders() {
    return this.request('GET', '/orders/my-orders');
  }

  static getOrder(id) {
    return this.request('GET', `/orders/${id}`);
  }

  // =============================
  // Artist role operations
  // =============================
  static getArtistProfile() {
    return this.request('GET', '/artist/profile');
  }

  static requestArtistProfileUpdate(data) {
    return this.request('PUT', '/artist/profile/request-update', data);
  }

  static getArtistSchedules() {
    return this.request('GET', '/artist/schedules');
  }

  static getArtistProducts() {
    return this.request('GET', '/artist/products');
  }

  static createArtistProduct(data) {
    return this.request('POST', '/artist/products', data);
  }

  static updateArtistProduct(id, data) {
    return this.request('PUT', `/artist/products/${id}`, data);
  }

  static deleteArtistProduct(id) {
    return this.request('DELETE', `/artist/products/${id}`);
  }

  static getArtistOrders() {
    return this.request('GET', '/artist/orders');
  }

  static getArtistOrder(id) {
    return this.request('GET', `/artist/orders/${id}`);
  }

  static updateArtistOrderStatus(id, status) {
    return this.request('PUT', `/artist/orders/${id}/status`, { status });
  }

  static deleteArtistOrder(id) {
    return this.request('DELETE', `/artist/orders/${id}`);
  }

  static getArtistEarnings() {
    return this.request('GET', '/artist/earnings');
  }

  // =============================
  // Admin user operations
  // =============================
  static getAdminUsers(filters = {}) {
    return this.request('GET', `/admin/users${this.buildQuery(filters)}`);
  }

  static createAdminUser(data) {
    return this.request('POST', '/admin/users', data);
  }

  static getAdminUser(id) {
    return this.request('GET', `/admin/users/${id}`);
  }

  static updateAdminUser(id, data) {
    return this.request('PUT', `/admin/users/${id}`, data);
  }

  static deleteAdminUser(id) {
    return this.request('DELETE', `/admin/users/${id}`);
  }

  static updateAdminUserRole(id, role) {
    return this.request('PATCH', `/admin/users/${id}/role`, { role });
  }

  // =============================
  // Admin product operations
  // =============================
  static getAdminProducts(filters = {}) {
    return this.request('GET', `/admin/products${this.buildQuery(filters)}`);
  }

  static createAdminProduct(data) {
    return this.request('POST', '/admin/products', data);
  }

  static updateAdminProduct(id, data) {
    return this.request('PUT', `/admin/products/${id}`, data);
  }

  static deleteAdminProduct(id) {
    return this.request('DELETE', `/admin/products/${id}`);
  }

  // =============================
  // Admin artist operations
  // =============================
  static getAdminArtists(filters = {}) {
    return this.request('GET', `/admin/artists${this.buildQuery(filters)}`);
  }

  static createAdminArtist(data) {
    return this.request('POST', '/admin/artists', data);
  }

  static getAdminArtist(id) {
    return this.request('GET', `/admin/artists/${id}`);
  }

  static updateAdminArtist(id, data) {
    return this.request('PUT', `/admin/artists/${id}`, data);
  }

  static deleteAdminArtist(id) {
    return this.request('DELETE', `/admin/artists/${id}`);
  }

  static getAdminArtistSchedules(artistId) {
    return this.request('GET', `/admin/artists/${artistId}/schedules`);
  }

  static createAdminArtistSchedule(artistId, data) {
    return this.request('POST', `/admin/artists/${artistId}/schedules`, data);
  }

  static updateAdminSchedule(scheduleId, data) {
    return this.request('PUT', `/admin/schedules/${scheduleId}`, data);
  }

  static deleteAdminSchedule(scheduleId) {
    return this.request('DELETE', `/admin/schedules/${scheduleId}`);
  }

  static getArtistProfileRequests(filters = {}) {
    return this.request('GET', `/admin/artists/profile-requests${this.buildQuery(filters)}`);
  }

  static approveArtistProfileRequest(id) {
    return this.request('POST', `/admin/artists/profile-requests/${id}/approve`);
  }

  static rejectArtistProfileRequest(id, adminNote = '') {
    return this.request('POST', `/admin/artists/profile-requests/${id}/reject`, {
      admin_note: adminNote
    });
  }

  // =============================
  // Admin order/revenue/notification operations
  // =============================
  static getAdminOrders(filters = {}) {
    return this.request('GET', `/admin/orders${this.buildQuery(filters)}`);
  }

  static getAdminOrder(id) {
    return this.request('GET', `/admin/orders/${id}`);
  }

  static updateAdminOrderStatus(id, status) {
    return this.request('PUT', `/admin/orders/${id}/status`, { status });
  }

  static deleteAdminOrder(id) {
    return this.request('DELETE', `/admin/orders/${id}`);
  }

  static getAdminRevenue(filters = {}) {
    return this.request('GET', `/admin/revenue${this.buildQuery(filters)}`);
  }

  static getAdminNotifications() {
    return this.request('GET', '/admin/notifications');
  }

  static markAdminNotificationAsRead(id) {
    return this.request('PATCH', `/admin/notifications/${id}/read`);
  }

  // =============================
  // Compatibility aliases for old/frontend code
  // =============================
  static createReview() {
    return Promise.reject(new Error('Backend hien tai chua co API danh gia san pham.'));
  }
}

window.AuthAPI = {
  register: (data) => APIClient.register(data),
  login: (emailOrData, password) => APIClient.login(emailOrData, password),
  logout: (redirectUrl) => APIClient.logout(redirectUrl),
  me: () => APIClient.me(),
  isLoggedIn: () => APIClient.isLoggedIn(),
  getCurrentUser: () => APIClient.getCurrentUser(),
  getRole: () => APIClient.getRole()
};

window.CartAPI = {
  get: () => APIClient.getCart(),
  add: (productId, quantity) => APIClient.addToCart(productId, quantity),
  update: (itemId, quantity) => APIClient.updateCartItem(itemId, quantity),
  remove: (itemId) => APIClient.removeFromCart(itemId),
  select: (itemId, isSelected) => APIClient.selectCartItem(itemId, isSelected),
  selectAll: (isSelected) => APIClient.selectAllCart(isSelected),
  count: () => APIClient.getCartCount()
};

window.ProductAPI = {
  list: (filters) => APIClient.getProducts(filters),
  detail: (id) => APIClient.getProduct(id)
};

window.ArtistAPI = {
  list: (filters) => APIClient.getArtists(filters),
  detail: (id) => APIClient.getArtist(id)
};

// Export for use in HTML files
window.APIClient = APIClient;
window.API_BASE_URL = API_BASE_URL;
window.API_UPLOAD_URL = API_UPLOAD_URL;
