"""
Clustering module for grouping pickup points based on geographic density.
Uses K-Means clustering to create balanced workloads for drivers.
"""

import numpy as np
from typing import List, Dict, Tuple
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import math

from .models import PickupPoint, Driver
from .distance_calculator import DistanceCalculator


class PickupClusterer:
    """Handles clustering of pickup points for driver assignment."""
    
    def __init__(self, distance_calculator: DistanceCalculator):
        """
        Initialize clusterer.
        
        Args:
            distance_calculator: Distance calculation utility
        """
        self.distance_calculator = distance_calculator
        self.scaler = StandardScaler()
    
    def cluster_pickups(self, 
                       pickup_points: List[PickupPoint], 
                       drivers: List[Driver],
                       balance_workload: bool = True) -> Dict[int, List[PickupPoint]]:
        """
        Cluster pickup points for optimal driver assignment.
        
        Args:
            pickup_points: List of pickup points to cluster
            drivers: List of available drivers
            balance_workload: Whether to balance workload across clusters
            
        Returns:
            Dictionary mapping cluster_id to list of pickup points
        """
        if len(pickup_points) == 0:
            return {}
        
        if len(drivers) == 0:
            raise ValueError("No drivers available for clustering")
        
        # Determine optimal number of clusters
        n_clusters = min(len(drivers), len(pickup_points))
        
        if n_clusters == 1:
            return {0: pickup_points}
        
        # Prepare features for clustering
        features = self._prepare_features(pickup_points, balance_workload)
        
        # Perform clustering
        clusters = self._perform_clustering(features, n_clusters)
        
        # Group pickup points by cluster
        clustered_points = {}
        for i, cluster_id in enumerate(clusters):
            if cluster_id not in clustered_points:
                clustered_points[cluster_id] = []
            clustered_points[cluster_id].append(pickup_points[i])
        
        # Optimize cluster assignment based on driver locations
        optimized_clusters = self._optimize_driver_assignment(clustered_points, drivers)
        
        return optimized_clusters
    
    def _prepare_features(self, pickup_points: List[PickupPoint], balance_workload: bool) -> np.ndarray:
        """
        Prepare feature matrix for clustering.
        
        Args:
            pickup_points: List of pickup points
            balance_workload: Whether to include workload balancing features
            
        Returns:
            Normalized feature matrix
        """
        features = []
        
        for point in pickup_points:
            feature_vector = [
                point.lat,
                point.lng,
            ]
            
            if balance_workload:
                # Add volume and priority as features for workload balancing
                feature_vector.extend([
                    point.volume,
                    point.priority_flag.priority_value,
                ])
            
            features.append(feature_vector)
        
        features_array = np.array(features)
        
        # Normalize features
        return self.scaler.fit_transform(features_array)
    
    def _perform_clustering(self, features: np.ndarray, n_clusters: int) -> np.ndarray:
        """
        Perform K-Means clustering with optimization.
        
        Args:
            features: Normalized feature matrix
            n_clusters: Number of clusters to create
            
        Returns:
            Cluster labels for each point
        """
        if n_clusters >= len(features):
            # If we have more clusters than points, assign each point to its own cluster
            return np.arange(len(features))
        
        # Try different random states and pick the best clustering
        best_clustering = None
        best_score = -1
        
        for random_state in range(5):  # Try 5 different initializations
            try:
                kmeans = KMeans(
                    n_clusters=n_clusters,
                    random_state=random_state,
                    n_init=10,
                    max_iter=300
                )
                
                clusters = kmeans.fit_predict(features)
                
                # Calculate silhouette score if we have enough points
                if len(features) > n_clusters:
                    score = silhouette_score(features, clusters)
                    if score > best_score:
                        best_score = score
                        best_clustering = clusters
                else:
                    best_clustering = clusters
                    break
                    
            except Exception as e:
                print(f"Clustering attempt {random_state} failed: {e}")
                continue
        
        if best_clustering is None:
            # Fallback: assign points to clusters round-robin
            return np.array([i % n_clusters for i in range(len(features))])
        
        return best_clustering
    
    def _optimize_driver_assignment(self, 
                                  clustered_points: Dict[int, List[PickupPoint]], 
                                  drivers: List[Driver]) -> Dict[int, List[PickupPoint]]:
        """
        Optimize cluster-to-driver assignment based on driver locations.
        
        Args:
            clustered_points: Initial clustering result
            drivers: List of available drivers
            
        Returns:
            Optimized cluster assignment
        """
        if len(clustered_points) != len(drivers):
            # If mismatched numbers, return original clustering
            return clustered_points
        
        # Calculate cluster centroids
        cluster_centroids = {}
        for cluster_id, points in clustered_points.items():
            if points:
                avg_lat = sum(p.lat for p in points) / len(points)
                avg_lng = sum(p.lng for p in points) / len(points)
                cluster_centroids[cluster_id] = (avg_lat, avg_lng)
        
        # Calculate distance matrix between drivers and cluster centroids
        driver_positions = [(d.base_lat, d.base_lng) for d in drivers]
        centroid_positions = [cluster_centroids[cid] for cid in sorted(cluster_centroids.keys())]
        
        distance_matrix = self.distance_calculator.batch_distances(
            driver_positions, centroid_positions
        )
        
        # Solve assignment problem using greedy approach
        # For production, consider using scipy.optimize.linear_sum_assignment
        assignments = self._greedy_assignment(distance_matrix)
        
        # Reassign clusters based on optimal assignment
        optimized_clusters = {}
        cluster_ids = sorted(clustered_points.keys())
        
        for driver_idx, cluster_idx in enumerate(assignments):
            original_cluster_id = cluster_ids[cluster_idx]
            optimized_clusters[driver_idx] = clustered_points[original_cluster_id]
        
        return optimized_clusters
    
    def _greedy_assignment(self, distance_matrix: List[List[float]]) -> List[int]:
        """
        Solve assignment problem using greedy approach.
        
        Args:
            distance_matrix: Distance matrix between drivers and clusters
            
        Returns:
            List where assignments[i] is the cluster assigned to driver i
        """
        n_drivers = len(distance_matrix)
        n_clusters = len(distance_matrix[0]) if distance_matrix else 0
        
        if n_drivers == 0 or n_clusters == 0:
            return []
        
        assignments = [-1] * n_drivers
        used_clusters = set()
        
        # Create list of (distance, driver_idx, cluster_idx) tuples
        distance_tuples = []
        for driver_idx in range(n_drivers):
            for cluster_idx in range(n_clusters):
                distance_tuples.append((
                    distance_matrix[driver_idx][cluster_idx],
                    driver_idx,
                    cluster_idx
                ))
        
        # Sort by distance (ascending)
        distance_tuples.sort()
        
        # Assign greedily
        for distance, driver_idx, cluster_idx in distance_tuples:
            if assignments[driver_idx] == -1 and cluster_idx not in used_clusters:
                assignments[driver_idx] = cluster_idx
                used_clusters.add(cluster_idx)
                
                # If all drivers assigned, break
                if len(used_clusters) == n_drivers:
                    break
        
        # Handle unassigned drivers (if any)
        for driver_idx in range(n_drivers):
            if assignments[driver_idx] == -1:
                # Assign to nearest available cluster
                min_distance = float('inf')
                best_cluster = 0
                for cluster_idx in range(n_clusters):
                    if cluster_idx not in used_clusters:
                        if distance_matrix[driver_idx][cluster_idx] < min_distance:
                            min_distance = distance_matrix[driver_idx][cluster_idx]
                            best_cluster = cluster_idx
                
                assignments[driver_idx] = best_cluster
                used_clusters.add(best_cluster)
        
        return assignments
    
    def analyze_cluster_balance(self, 
                              clustered_points: Dict[int, List[PickupPoint]]) -> Dict[str, float]:
        """
        Analyze the balance of workload across clusters.
        
        Args:
            clustered_points: Clustered pickup points
            
        Returns:
            Dictionary with balance metrics
        """
        if not clustered_points:
            return {
                'total_points': 0,
                'total_volume': 0.0,
                'average_points_per_cluster': 0.0,
                'average_volume_per_cluster': 0.0,
                'points_std_deviation': 0.0,
                'volume_std_deviation': 0.0,
                'balance_score': 0.0
            }
        
        # Calculate metrics per cluster
        points_per_cluster = []
        volume_per_cluster = []
        priority_distribution = {'red': 0, 'yellow': 0, 'green': 0}
        
        for cluster_points in clustered_points.values():
            points_per_cluster.append(len(cluster_points))
            volume_per_cluster.append(sum(p.volume for p in cluster_points))
            
            for point in cluster_points:
                priority_distribution[point.priority_flag.value] += 1
        
        # Calculate statistics
        total_points = sum(points_per_cluster)
        total_volume = sum(volume_per_cluster)
        
        avg_points = np.mean(points_per_cluster) if points_per_cluster else 0
        avg_volume = np.mean(volume_per_cluster) if volume_per_cluster else 0
        
        points_std = np.std(points_per_cluster) if len(points_per_cluster) > 1 else 0
        volume_std = np.std(volume_per_cluster) if len(volume_per_cluster) > 1 else 0
        
        # Calculate balance score (lower std deviation = better balance)
        balance_score = 1.0
        if avg_points > 0:
            points_cv = points_std / avg_points  # Coefficient of variation
            balance_score *= max(0, 1 - points_cv)
        
        if avg_volume > 0:
            volume_cv = volume_std / avg_volume
            balance_score *= max(0, 1 - volume_cv)
        
        return {
            'total_points': total_points,
            'total_volume': total_volume,
            'average_points_per_cluster': avg_points,
            'average_volume_per_cluster': avg_volume,
            'points_std_deviation': points_std,
            'volume_std_deviation': volume_std,
            'balance_score': balance_score,
            'priority_distribution': priority_distribution
        }
