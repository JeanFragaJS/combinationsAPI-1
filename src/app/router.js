import { Router } from 'express';
import dotenv from 'dotenv';
import {ControllerUpdateCombinations} from '../presentation/controllers/controller-update-combination.js'
import { ControllerCombinationsById } from '../presentation/controllers/controller-combinations-by-id.js'
import { ControllerTopCombinations } from '../presentation/controllers/controller-top-combinations.js'
 dotenv.config();

const Routes = new Router();

Routes.get('/', (req, res) => res.send('Combinations-API - Endpoint padrão!'));

Routes.post('/order-processor', ControllerUpdateCombinations.handle);
Routes.get('/combinations-by-id', ControllerCombinationsById.handle)
Routes.get('/store-top-combinations', ControllerTopCombinations.handle)

export default Routes;

