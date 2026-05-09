import { ZodError } from 'zod';
const validate=(schema)=>(req,res,next)=>{
    try{
        schema.parse(req.body);
        next();
    }catch(err){
        if(err instanceof ZodError){ 
             return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: err.errors.map(e => ({
                    champ: e.path[0],
                    message: e.message
                }))
            });
        }
           next(err);
    }
}
export default validate;