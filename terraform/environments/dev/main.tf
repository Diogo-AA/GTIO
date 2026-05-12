provider "aws" {
  region = "us-east-1"
}

module "network" {
  source      = "../../modules/network"
  environment = "dev"
  vpc_cidr    = "10.1.0.0/16"
}

module "persistence" {
  source                     = "../../modules/persistence"
  environment                = "dev"
  vpc_id                     = module.network.vpc_id
  private_subnet_ids         = module.network.private_subnet_ids
  allowed_security_group_ids = [module.compute.ecs_task_sg_id]

  db_user        = var.db_user
  db_password    = var.db_password
  db_name        = "votacion_db_dev"
  instance_class = "db.t3.micro"
}

module "compute" {
  source            = "../../modules/compute"
  environment       = "dev"
  aws_region        = module.network.aws_region
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids

  db_address  = module.persistence.db_address
  db_port     = 3306
  db_user     = var.db_user
  db_password = var.db_password
  db_name     = "votacion_db_dev"

  desired_count = 1
}
