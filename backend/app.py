"""
FastAPI Backend for DevOps Monitoring Dashboard
L1 Health Checks for EC2, EKS/ECS, RDS, and Couchbase
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import boto3
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import psycopg2
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="DevOps Monitoring API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AWS Clients - Initialize once
AWS_REGION = "us-east-1"  # Change to your region
try:
    ec2_client = boto3.client('ec2', region_name=AWS_REGION)
    ecs_client = boto3.client('ecs', region_name=AWS_REGION)
    eks_client = boto3.client('eks', region_name=AWS_REGION)
    rds_client = boto3.client('rds', region_name=AWS_REGION)
    cloudwatch = boto3.client('cloudwatch', region_name=AWS_REGION)
except Exception as e:
    logger.error(f"Error initializing AWS clients: {e}")
    # Continue without AWS clients for testing

# Application configuration - Map application names to resource IDs
APP_CONFIG = {
    "Customer Portal": {
        "ec2_instances": ["i-xxxxx1", "i-xxxxx2"],
        "eks_clusters": ["cust-eks"],
        "rds_instances": ["cust-db", "cust-oracle"],
        "couchbase_endpoints": ["cust-couch.couchbase.com"]
    },
    "Billing Platform": {
        "ec2_instances": ["i-xxxxx3"],
        "ecs_clusters": ["bill-ecs"],
        "rds_instances": ["bill-db"],
    },
    # Add other applications...
}


@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "DevOps Monitoring API",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/applications")
def list_applications():
    """Get list of all monitored applications"""
    return {
        "applications": list(APP_CONFIG.keys()),
        "count": len(APP_CONFIG)
    }


@app.get("/api/health/{app_name}")
async def get_application_health(app_name: str) -> Dict:
    """
    Get comprehensive health check for an application
    Returns EC2, EKS/ECS, and Database health status
    """
    if app_name not in APP_CONFIG:
        raise HTTPException(status_code=404, detail=f"Application '{app_name}' not found")
    
    config = APP_CONFIG[app_name]
    
    try:
        health_data = {
            "application": app_name,
            "timestamp": datetime.now().isoformat(),
            "components": {
                "ec2": await check_ec2_instances(config.get("ec2_instances", [])),
                "eks": await check_eks_clusters(config.get("eks_clusters", [])),
                "ecs": await check_ecs_clusters(config.get("ecs_clusters", [])),
                "rds": await check_rds_instances(config.get("rds_instances", [])),
                "couchbase": await check_couchbase(config.get("couchbase_endpoints", []))
            }
        }
        return health_data
    except Exception as e:
        logger.error(f"Error getting health for {app_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def check_ec2_instances(instance_ids: List[str]) -> List[Dict]:
    """Check EC2 instance health"""
    if not instance_ids:
        return []
    
    instances = []
    try:
        response = ec2_client.describe_instances(InstanceIds=instance_ids)
        
        for reservation in response['Reservations']:
            for instance in reservation['Instances']:
                instance_id = instance['InstanceId']
                
                # Get instance name from tags
                name = next(
                    (tag['Value'] for tag in instance.get('Tags', []) if tag['Key'] == 'Name'),
                    instance_id
                )
                
                # Get CloudWatch metrics
                cpu_usage = get_cloudwatch_metric(
                    instance_id, 
                    'CPUUtilization',
                    namespace='AWS/EC2'
                )
                
                instances.append({
                    "name": name,
                    "instance_id": instance_id,
                    "status": instance['State']['Name'],  # running, stopped, etc.
                    "cpu": round(cpu_usage, 2),
                    "mem": get_memory_metric(instance_id),  # Custom metric if available
                    "zone": instance['Placement']['AvailabilityZone'],
                    "instance_type": instance['InstanceType'],
                    "launch_time": instance['LaunchTime'].isoformat()
                })
    except Exception as e:
        logger.error(f"Error checking EC2 instances: {e}")
        # Return mock data if AWS is not configured
        return get_mock_ec2_data(instance_ids)
    
    return instances


async def check_eks_clusters(cluster_names: List[str]) -> List[Dict]:
    """Check EKS cluster health"""
    if not cluster_names:
        return []
    
    clusters = []
    try:
        for cluster_name in cluster_names:
            response = eks_client.describe_cluster(name=cluster_name)
            cluster = response['cluster']
            
            # Get node count (requires kubectl or additional API calls)
            node_count = 3  # Placeholder - implement actual node count
            pod_count = 80  # Placeholder - implement actual pod count
            
            clusters.append({
                "name": cluster_name,
                "status": cluster['status'].lower(),  # ACTIVE -> healthy
                "nodes": node_count,
                "pods": pod_count,
                "version": cluster['version'],
                "region": cluster['arn'].split(':')[3],
                "endpoint": cluster['endpoint']
            })
    except Exception as e:
        logger.error(f"Error checking EKS clusters: {e}")
        return get_mock_eks_data(cluster_names)
    
    return clusters


async def check_ecs_clusters(cluster_names: List[str]) -> List[Dict]:
    """Check ECS cluster health"""
    if not cluster_names:
        return []
    
    clusters = []
    try:
        for cluster_name in cluster_names:
            # Describe cluster
            cluster_response = ecs_client.describe_clusters(clusters=[cluster_name])
            cluster = cluster_response['clusters'][0]
            
            # List services
            services_response = ecs_client.list_services(cluster=cluster_name)
            service_count = len(services_response['serviceArns'])
            
            # List tasks
            tasks_response = ecs_client.list_tasks(cluster=cluster_name)
            task_count = len(tasks_response['taskArns'])
            
            clusters.append({
                "name": cluster_name,
                "status": cluster['status'].lower(),
                "services": service_count,
                "tasks": task_count,
                "region": cluster['clusterArn'].split(':')[3],
                "registered_instances": cluster['registeredContainerInstancesCount']
            })
    except Exception as e:
        logger.error(f"Error checking ECS clusters: {e}")
        return get_mock_ecs_data(cluster_names)
    
    return clusters


async def check_rds_instances(db_identifiers: List[str]) -> List[Dict]:
    """Check RDS database health"""
    if not db_identifiers:
        return []
    
    databases = []
    try:
        for db_id in db_identifiers:
            response = rds_client.describe_db_instances(DBInstanceIdentifier=db_id)
            db = response['DBInstances'][0]
            
            # Get CloudWatch metrics
            cpu_usage = get_cloudwatch_metric(
                db_id,
                'CPUUtilization',
                namespace='AWS/RDS',
                dimensions=[{'Name': 'DBInstanceIdentifier', 'Value': db_id}]
            )
            
            # Test connection (optional - can be slow)
            connection_status = test_database_connection(db)
            
            databases.append({
                "name": db_id,
                "engine": db['Engine'],
                "status": "healthy" if db['DBInstanceStatus'] == 'available' else "warning",
                "cpu": round(cpu_usage, 2),
                "mem": 40,  # Placeholder - calculate from CloudWatch
                "storage": calculate_storage_usage(db),
                "endpoint": db['Endpoint']['Address'],
                "port": db['Endpoint']['Port'],
                "connection_test": connection_status
            })
    except Exception as e:
        logger.error(f"Error checking RDS instances: {e}")
        return get_mock_rds_data(db_identifiers)
    
    return databases


async def check_couchbase(endpoints: List[str]) -> List[Dict]:
    """Check Couchbase cluster health"""
    if not endpoints:
        return []
    
    databases = []
    try:
        for endpoint in endpoints:
            # Implement Couchbase health check using SDK
            # This is a placeholder implementation
            databases.append({
                "name": endpoint.split('.')[0],
                "status": "healthy",
                "cpu": 10,
                "mem": 20,
                "storage": 30,
                "endpoint": endpoint
            })
    except Exception as e:
        logger.error(f"Error checking Couchbase: {e}")
    
    return databases


def get_cloudwatch_metric(
    resource_id: str, 
    metric_name: str,
    namespace: str = 'AWS/EC2',
    dimensions: Optional[List[Dict]] = None
) -> float:
    """Get CloudWatch metric value"""
    try:
        if dimensions is None:
            dimensions = [{'Name': 'InstanceId', 'Value': resource_id}]
        
        response = cloudwatch.get_metric_statistics(
            Namespace=namespace,
            MetricName=metric_name,
            Dimensions=dimensions,
            StartTime=datetime.now() - timedelta(minutes=5),
            EndTime=datetime.now(),
            Period=300,
            Statistics=['Average']
        )
        
        if response['Datapoints']:
            return response['Datapoints'][0]['Average']
    except Exception as e:
        logger.error(f"Error getting CloudWatch metric: {e}")
    
    return 0.0


def get_memory_metric(instance_id: str) -> float:
    """Get memory usage (requires CloudWatch agent)"""
    # Placeholder - implement if CloudWatch agent is configured
    return 50.0


def calculate_storage_usage(db_instance: Dict) -> float:
    """Calculate storage usage percentage"""
    allocated = db_instance.get('AllocatedStorage', 100)
    # In real implementation, get actual used storage
    return 70.0  # Placeholder


def test_database_connection(db_instance: Dict) -> str:
    """Test database connection"""
    try:
        engine = db_instance['Engine']
        endpoint = db_instance['Endpoint']['Address']
        port = db_instance['Endpoint']['Port']
        
        # Implement actual connection test
        # This is a placeholder
        return "success"
    except Exception as e:
        return f"failed: {str(e)}"


# Mock data functions for testing without AWS
def get_mock_ec2_data(instance_ids: List[str]) -> List[Dict]:
    """Return mock EC2 data for testing"""
    import random
    return [
        {
            "name": f"instance-{i}",
            "instance_id": instance_id,
            "status": random.choice(["running", "stopped"]),
            "cpu": random.randint(10, 90),
            "mem": random.randint(20, 80),
            "zone": f"us-east-1{chr(97+i)}",
            "instance_type": "t3.medium",
            "launch_time": datetime.now().isoformat()
        }
        for i, instance_id in enumerate(instance_ids)
    ]


def get_mock_eks_data(cluster_names: List[str]) -> List[Dict]:
    """Return mock EKS data for testing"""
    return [
        {
            "name": name,
            "status": "healthy",
            "nodes": 5,
            "pods": 120,
            "version": "1.28",
            "region": "us-east-1"
        }
        for name in cluster_names
    ]


def get_mock_ecs_data(cluster_names: List[str]) -> List[Dict]:
    """Return mock ECS data for testing"""
    return [
        {
            "name": name,
            "status": "healthy",
            "services": 4,
            "tasks": 18,
            "region": "us-east-1"
        }
        for name in cluster_names
    ]


def get_mock_rds_data(db_identifiers: List[str]) -> List[Dict]:
    """Return mock RDS data for testing"""
    import random
    return [
        {
            "name": db_id,
            "engine": random.choice(["Postgres", "Oracle"]),
            "status": "healthy",
            "cpu": random.randint(10, 70),
            "mem": random.randint(20, 60),
            "storage": random.randint(30, 80),
            "endpoint": f"{db_id}.xxxx.rds.amazonaws.com",
            "port": 5432
        }
        for db_id in db_identifiers
    ]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
