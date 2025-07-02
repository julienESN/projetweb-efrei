"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let UserService = class UserService {
    userEventsQueue;
    constructor(userEventsQueue) {
        this.userEventsQueue = userEventsQueue;
    }
    users = [
        {
            id: '1',
            email: 'admin@example.com',
            username: 'admin',
            role: user_role_enum_1.UserRole.ADMIN,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: '2',
            email: 'user@example.com',
            username: 'user',
            role: user_role_enum_1.UserRole.USER,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
    findAll() {
        return this.users;
    }
    findById(id) {
        return this.users.find((user) => user.id === id);
    }
    findByEmail(email) {
        return this.users.find((user) => user.email === email);
    }
    create(userData) {
        const newUser = {
            id: (this.users.length + 1).toString(),
            email: userData.email,
            username: userData.username,
            role: userData.role || user_role_enum_1.UserRole.USER,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.push(newUser);
        void this.userEventsQueue.add('user-event', {
            action: 'create',
            userId: newUser.id,
            timestamp: new Date(),
        });
        return newUser;
    }
    update(id, userData) {
        const userIndex = this.users.findIndex((user) => user.id === id);
        if (userIndex === -1)
            return undefined;
        this.users[userIndex] = {
            ...this.users[userIndex],
            ...userData,
            updatedAt: new Date(),
        };
        return this.users[userIndex];
    }
    delete(id) {
        const userIndex = this.users.findIndex((user) => user.id === id);
        if (userIndex === -1)
            return false;
        this.users.splice(userIndex, 1);
        void this.userEventsQueue.add('user-event', {
            action: 'delete',
            userId: id,
            timestamp: new Date(),
        });
        return true;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('user-events')),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], UserService);
//# sourceMappingURL=user.service.js.map