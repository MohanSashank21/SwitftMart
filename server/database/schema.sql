create database if not exists swiftmart_db;

use swiftmart_db

-- // user

create table users(
  id bigint primary key auto_increment,
  name varchar(100) not null,
  email varchar(100) not null unique,
  password_hash varchar(100) not null,
  phone varchar(15) not null unique,
  role enum('customer','store_manager','delivery_boy','admin') not null,
  created_at timestamp default current_timestamp
);

create table stores(
  id bigint primary key  auto_increment,
  name varchar(100) not null,
  latitude decimal(11,10) not null,
  longitude decimal(11,10) not null,
  address varchar(100) not null,
  created_at timestamp default current_timestamp,
  opening_time time not null,
  closing_time time not null
);

create table store_manager(
  user_id bigint primary key,
  store_id bigint not null,
  foreign key(user_id) references users(id) on delete cascade,
  foreign key(store_id) references stores(id) on delete cascade
);

create table delivery_boy(
  user_id bigint primary key,
  store_id bigint not null,
  vehicle_no varchar(20) not null unique,
  latitude decimal(11,10) not null,
  longitude decimal(11,10) not null,
  rating decimal(3,2) not null default 0.00,
  active_orders int not null default 0,
  total_deliveries bigint not null default 0,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (store_id) refernces stores(id) on delete cascade
);

create table categories(
  id bigint primary key auto_increment,
  name varchar(100) not null unique,
  image_url varchar(100) not null,
  display_order int not null default 1,
  is_active boolean not null default true,
  created_at timestamp default current_timestamp
);

create table subcategories(
  id bigint primary key auto_increment ,
  category_id bigint not null ,
  name varchar(100) not null ,
  image_url varchar(100) not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamp default current_timestamp,
  foreign key(category_id) references categories(id) on delete cascade,
  unique(category_id,name)
);

create table products(
  id bigint primary key auto_increment,
  name varchar(100) not null,
  subcategory_id bigint not null,
  brand varchar(100) not null ,
  description TEXT not null,
  total_ratings bigint not null default 0,
  average_rating decimal(3,2) not null default 0,
  is_veg boolean default true,
  is_active boolean default true,
  foreign key (subcategory_id) references subcategories(id) on delete cascade
);

create table product_images(
  id bigint primary key auto_increment,
  product_id bigint not null,
  image_url varchar(255) not null,
  display_order int not null default 1,
  foreign key(product_id) references products(id) on delete cascade
);

create table product_variants (
  id bigint primary key auto_increment,
  product_id bigint not null,
  quantity decimal(10,2) not null,
  unit enum('g','kg','ml','l','pcs','pack') not null,
  mrp decimal(10,2) not null,
  selling_price decimal(10,2) not null,
  estimated_packing_time int not null,
  is_active boolean default true,
  created_at timestamp default current_timestamp,
  foreign key(product_id) references products(id) on delete cascade
);

create table cart(
  id bigint primary key auto_increment,
  user_id bigint not null unique,
  foreign key(user_id) references users(id) on delete cascade
);

create table cartitems(
  cart_id bigint not null,
  product_variant_id bigint not null,
  quantity int not null default 1,
  foreign key (cart_id) references cart(id) on delete cascade,
  foreign key (product_variant_id) references product_variants(id) on delete cascade,
  primary key(cart_id,product_variant_id)
);

create table attributes(
  id bigint primary key auto_increment,
  name varchar(100) not null
);

create table attribute_values(
  id bigint primary key auto_increment,
  attribute_id bigint not null,
  value varchar(100) not null,
  foreign key(attribute_id) references attribute(id) on delete cascade,
  unique(attribute_id,value)
);

create table subcategory_attributes(
  attribute_id bigint not null,
  subcategory_id bigint not null,
  foreign key (attribute_id) references attributes(id) on delete cascade,
  foreign key (subcategory_id) references subcategories(id) on delete cascade,
  primary key(attribute_id,subcategory_id)
);

create table inventory(
  store_id bigint not null,
  product_variant_id bigint not null,
  total_stock_at_store bigint not null default 0,
  reserved_stock bigint not null default 0,
  foreign key (store_id) references stores(id) on delete cascade,
  foreign key (product_variant_id) references product_variants(id) on delete cascade,
  primary key(store_id,product_variant_id)
);

create table orders(
  id bigint primary key auto_increment,
  user_id bigint not null,
  store_id bigint  null,
  delivery_boy_id bigint  null,
  sub_total decimal(10,2) not null,
  delivery_fee decimal(10,2) not null default 0,
  total_amount decimal(10,2) not null,
  status enum('confirmed','packing','packed','cancelled','out_for_delivery','delivered') default 'confirmed',
  estimated_packing_time int not null,
  delivery_address text not null,
  latitude decimal(10,7) not null,
  longitude decimal(10,7) not null,
  qr_token varchar(100) not null,
  qr_verified boolean default false,
  created_at timestamp default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (store_id) references stores(id) on delete cascade,
  foreign key (delivery_boy_id) references delivery_boy(user_id) on delete set null
);

create table order_items(
  order_id bigint not null,
  product_variant_id bigint not null,
  quantity int not null default 1,
  price decimal(10,2) not null,
  foreign key (order_id) references orders(id) on delete cascade,
  foreign key (product_variant_id) references product_variants(id) on delete cascade,
  primary key(order_id,product_variant_id)
);

create table notifications(
  id bigint primary key auto_increment,
  user_id bigint not null,
  product_variant_id bigint not null,
  store_id bigint not null,
  created_at timestamp default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (product_variant_id) references product_variants(id) on delete cascade,
  foreign key (store_id) references stores(id) on delete cascade,
  unique(user_id,product_variant_id,store_id)
);

create table reviews(
  user_id bigint not null,
  product_variant_id bigint not null,
  rating int not null check (rating beween 1 and 5),
  review text,
  created_at timestamp default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (product_variant_id) references product_variants(id) on delete cascade
);

create table payments(
  id bigint primary key auto_increment,
  order_id bigint not null unique,
  payment_method enum(
    'upi','card','net_banking','wallet','cash_delivery'
  ) not null,
  payment_status enum(
    'pending','success','failed','refunded'
  ) not null,
  transaction_id varchar(100) unique,
  foreign key (order_id) references orders(id) on delete cascade
);

create table issues(
  id bigint primary key auto_increment,
  order_item_id bigint not null,
  issue_type enum('damaged','wrong product','missing','expired','poor quality','other') not null,
  description text,
  status enum(
    'open','under_review','resolved','rejected'
  ) not null default 'open',
  created_at timestamp default current_timestamp,
  foreign key (order_item_id) references order_items(id) on delete cascade );


create table refund(
 id bigint primary key auto_increment,
 payment_id bigint not null,
 order_items_id bigint not null,
 refund_amount decimal(10,2) not null,
 refund_reason varchar(255) not null,
 refund_status enum(
  'initiated','failed','completed'
 ) not null default 'initiated',
 created_at timestamp  default current_timestamp,
 refunded_At timestamp default null,
 foreign key (payment_id) references payments(id) on delete cascade,
 foreign key (order_item_id) references order_items(id)  on delete set null
)









