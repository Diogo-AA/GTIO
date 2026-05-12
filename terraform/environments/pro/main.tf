provider "aws" {
  region = "us-east-1"
}

module "network" {
  source      = "../../modules/network"
  environment = "pro"
  vpc_cidr    = "10.3.0.0/16"
}

module "persistence" {
  source                     = "../../modules/persistence"
  environment                = "pro"
  vpc_id                     = module.network.vpc_id
  private_subnet_ids         = module.network.private_subnet_ids
  allowed_security_group_ids = [module.compute.ecs_task_sg_id]

  db_user        = var.db_user
  db_password    = var.db_password
  db_name        = "votacion_db_pro"
  instance_class = "db.t3.small" # Mayor capacidad para pro
}

module "compute" {
  source            = "../../modules/compute"
  environment       = "pro"
  aws_region        = module.network.aws_region
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids

  db_address  = module.persistence.db_address
  db_port     = 3306
  db_user     = var.db_user
  db_password = var.db_password
  db_name     = "votacion_db_pro"

  desired_count = 2 # Alta disponibilidad en pro
}

module "observability" {
  source           = "../../modules/observability"
  environment      = "pro"
  aws_region       = module.network.aws_region
  alarm_email      = var.alarm_email
  alb_arn_suffix   = module.compute.alb_arn_suffix
  ecs_cluster_name = module.compute.ecs_cluster_name
  ecs_service_name = module.compute.ecs_service_name
  db_instance_id   = module.persistence.db_instance_id

  # Umbrales más estrictos en producción
  alarm_5xx_threshold     = 5
  alarm_latency_threshold = 0.5
  alarm_cpu_threshold     = 70
}
