function setup(args, ctx) {
    ctx.ray = new sumerian.Ray();
    ctx.physicsSystem = ctx.world.getSystem('PhysicsSystem');
    ctx.result = new sumerian.RaycastResult();
    ctx.entityData.updatePosition = false;

    ctx.mousedown = function (evt) {

        if (ctx.entityData.updatePosition) {
            return;
        }

        let dpr = ctx.world.sumerianRunner.renderer.devicePixelRatio;
        let x = evt.clientX * dpr;
        let y = evt.clientY * dpr;
        let activeCamera = ctx.activeCameraEntity.cameraComponent.camera;

        activeCamera.getPickRay(x, y, ctx.viewportWidth, ctx.viewportHeight, ctx.ray);

        ctx.physicsSystem.raycastClosest(ctx.ray.origin, ctx.ray.direction, args.maxDistance, {}, ctx.result);
        if (ctx.result.entity === args.MovableEntity) {
            ctx.entityData.updatePosition = true;
        }

        ctx.result.reset();
    };

    ctx.mouseup = function () {
        ctx.entityData.updatePosition = false;
    };

    ctx.mousemove = function (evt) {

        if (!ctx.entityData.updatePosition) {
            return;
        }

        let dpr = ctx.world.sumerianRunner.renderer.devicePixelRatio;
        let x = evt.clientX * dpr;
        let y = evt.clientY * dpr;
        let activeCamera = ctx.activeCameraEntity.cameraComponent.camera;

        activeCamera.getPickRay(x, y, ctx.viewportWidth, ctx.viewportHeight, ctx.ray);
        
        ctx.physicsSystem.raycastAll(ctx.ray.origin, ctx.ray.direction, args.maxDistance, {}, function (results) {
            if (results.entity === args.MoveOnEntity) {
                let vOrigin = new sumerian.Vector3(ctx.ray.origin._x, ctx.ray.origin._y, ctx.ray.origin._z)
                let vDirection = new sumerian.Vector3(ctx.ray.direction._x, ctx.ray.direction._y, ctx.ray.direction._z)
                vDirection.normalize();
                let vDistance = new sumerian.Vector3(results.distance, results.distance, results.distance);

                let endPoint = vOrigin.add(vDirection.mul(vDistance));

                args.MovableEntity.transformComponent.setTranslation(endPoint);
            }
        });
    };

    ctx.domElement.addEventListener('mousedown', ctx.mousedown);
    ctx.domElement.addEventListener('mouseup', ctx.mouseup);
    ctx.domElement.addEventListener('mousemove', ctx.mousemove);
}

function cleanup(args, ctx) {
    ctx.domElement.removeEventListener('mousedown', ctx.mousedown);
    ctx.domElement.removeEventListener('mouseup', ctx.mouseup);
    ctx.domElement.removeEventListener('mousemove', ctx.mousemove);
}

var parameters = [{
        key: 'MovableEntity',
        type: 'entity'
    },
    {
        key: 'MoveOnEntity',
        type: 'entity'
    },
    {
        key: 'maxDistance',
        type: 'float',
        'default': 10000,
        min: 0
    }
]