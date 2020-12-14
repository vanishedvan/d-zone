import { Entity, Query, System } from 'ape-ecs'
import Transform from '../components/transform'
import Sprite from '../components/sprite'
import { get2dCoordsFromIso, getZIndex } from '../../common/projection'

export default class TransformSystem extends System {
	private transformQuery!: Query
	init() {
		this.transformQuery = this.createQuery()
			.fromAll(Transform, Sprite)
			.persist(true)
	}
	update(tick: number) {
		this.transformQuery.execute().forEach((entity: Entity) => {
			if (entity.c[Transform.key]._meta.updated !== tick) return
			const { x, y, z } = entity.c[Transform.key]
			const [newX, newY] = get2dCoordsFromIso(x, y, z)
			entity.c[Sprite.key].update({
				x: newX,
				y: newY,
				zIndex: getZIndex(x, y, z),
			})
		})
	}
}
