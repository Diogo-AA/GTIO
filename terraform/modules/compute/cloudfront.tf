# Este archivo se ha vaciado a propósito.
#
# Plan A (CloudFront delante del ALB) NO se puede usar en AWS Academy porque
# la LabRole tiene capada la acción cloudfront:CreateDistribution:
#   AccessDenied: User: ... is not authorized to perform: cloudfront:CreateDistribution
#
# Se ha sustituido por el Plan B (certificado autofirmado + listener HTTPS en
# el propio ALB), que sí está permitido en AWS Academy.
# Ver: terraform/modules/compute/alb_https.tf
