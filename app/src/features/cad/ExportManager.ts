import * as THREE from 'three';
import { STLExporter } from 'three-stdlib';
import { useCADStore } from '../../store/cadStore';

export const useExport = () => {
    const { solids } = useCADStore();

    const exportSTL = () => {
        const exporter = new STLExporter();
        const scene = new THREE.Scene();
        
        // Recreate scene for export (simplified)
        solids.forEach(solid => {
             let geometry;
             switch(solid.type) {
                 case 'CUBE': geometry = new THREE.BoxGeometry(1, 1, 1); break;
                 case 'SPHERE': geometry = new THREE.SphereGeometry(0.5, 32, 32); break;
                 default: geometry = new THREE.BoxGeometry(1, 1, 1);
             }
             const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
             mesh.position.set(solid.position.x, solid.position.y, solid.position.z);
             mesh.rotation.set(solid.rotation.x, solid.rotation.y, solid.rotation.z);
             mesh.scale.set(solid.scale.x, solid.scale.y, solid.scale.z);
             scene.add(mesh);
        });

        const result = exporter.parse(scene, { binary: true });
        const blob = new Blob([result], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'starkcad-model.stl';
        link.click();
    };

    return { exportSTL };
};
