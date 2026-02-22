Backend : Rest API (Express + Mongoose + Redis)
Frontend : WEB UI (NextJS)

*###Backend###*:
1. cd backend
2. npm install
3. copy env.example .env
Generate connection to mongoDb in LOCAL :  mongodb://localhost:27017/task-tracker
Add the JWT_SECRET in env.

Commands to generate JWT_SECRET
 node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 4. npm run dev 

 Server running fine if MongoDb and redis connection are established well.


 *###Frontend###*
 1. cd frontend
 2. npm install
 3. copy env.local.example .env.local
 4. npm run dev

