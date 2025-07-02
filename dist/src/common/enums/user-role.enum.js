"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
const graphql_1 = require("@nestjs/graphql");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
(0, graphql_1.registerEnumType)(UserRole, {
    name: 'UserRole',
    description: 'Les rôles possibles pour un utilisateur',
});
//# sourceMappingURL=user-role.enum.js.map