import express from 'express';
import Client from '../models/Client';

const clientsRouter = express.Router();

clientsRouter.get('/', async(req, res, next)=>{
    try{
        const clients = await Client.find();
        return res.send(clients);
    }catch(e){
        next(e);
    }
});

clientsRouter.get('/:id', async(req, res, next)=>{
    try{
        const client = await Client.findById(req.params.id);
        return res.send(client);
    }catch(e){
        next(e);
    }
});

export default clientsRouter;