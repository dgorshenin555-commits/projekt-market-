// === Роли пользователей ===
export type UserRole = 'customer' | 'designer' | 'expert' | 'manufacturer';

// === Пользователь ===
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company?: string;
  phone?: string;
  avatar?: string;
  region?: string;
  specializations?: string[];
  sroNumber?: string;
  description?: string;
  createdAt: string;
}

// === Типы объектов ===
export type ObjectType =
  | 'private'
  | 'commercial'
  | 'industrial'
  | 'linear'
  | 'buildings';

// === Стадии проектирования ===
export type DesignStage = 'P' | 'RD';

// === Масштаб проекта ===
export type ProjectScale = 'single' | 'team';

// === Статус заявки ===
export type OrderStatus =
  | 'draft'
  | 'published'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

// === Заявка на проектирование ===
export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  description: string;
  objectType: ObjectType;
  region: string;
  scale: ProjectScale;
  stage: DesignStage;
  sections: string[];
  specialists: string[];
  budget?: string;
  deadline?: string;
  status: OrderStatus;
  responsesCount: number;
  createdAt: string;
}

// === Отклик подрядчика ===
export interface OrderResponse {
  id: string;
  orderId: string;
  designerId: string;
  designerName: string;
  designerCompany?: string;
  message: string;
  proposedBudget?: string;
  proposedDeadline?: string;
  createdAt: string;
}

// === Проектировщик ===
export interface Designer {
  id: string;
  name: string;
  type: 'person' | 'company';
  sections: string[];
  city: string;
  region?: string;
  sroNumber?: string;
  rating: number;
  reviewsLabel: string;
  projectsCount: number;
  yearsExperience?: number;
  avatar?: string;
  phone?: string;
  email?: string;
  achievements?: string[];
  description?: string;
}

// === Проект проектировщика (для боковой панели) ===
export interface DesignerProject {
  id: string;
  title: string;
  location: string;
  projectsCount: number;
  image?: string;
}

// === Производитель ===
export interface Manufacturer {
  id: string;
  name: string;
  description: string;
  tags: string[];
  city?: string;
  rating: number;
  projectsCount: number;
  deliveryRegion?: string;
  website?: string;
  email?: string;
  phone?: string;
}

// === Продукт производителя ===
export interface ManufacturerProduct {
  id: string;
  name: string;
  subtitle: string;
  tags: string[];
  spec?: string;
  certCount?: number;
}

// === Нормативный документ ===
export interface StandardDocument {
  id: string;
  code: string;
  title: string;
  type: 'ГОСТ' | 'СП' | 'СНиП' | 'ТУ' | 'ISO';
  section: string;
  year: number;
  status: 'Актуален' | 'Устарел' | 'Отменён';
  updatedYear?: number;
  isFeatured?: boolean;
}

// === Заявка на экспертизу ===
export interface ExpertiseRequest {
  id: string;
  title: string;
  description: string;
  objectType: ObjectType;
  sections: string[];
  requiredSro: boolean;
  budget?: string;
  deadline?: string;
  responsesCount: number;
  createdAt: string;
}

// === Экспертиза в работе (Проект) ===
export interface ExpertiseProject {
  id: string;
  title: string;
  company: string;
  status: 'На проверке' | 'Ожидает исправлений' | 'Положительное заключение';
  totalRemarks: number;
  fixedRemarks: number;
  criticalRemarks: number;
  dueDate: string;
}
