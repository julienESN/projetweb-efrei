"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogAction = void 0;
const graphql_1 = require("@nestjs/graphql");
var LogAction;
(function (LogAction) {
    LogAction["CREATE"] = "CREATE";
    LogAction["UPDATE"] = "UPDATE";
    LogAction["DELETE"] = "DELETE";
    LogAction["VIEW"] = "VIEW";
})(LogAction || (exports.LogAction = LogAction = {}));
(0, graphql_1.registerEnumType)(LogAction, {
    name: 'LogAction',
    description: 'Les actions possibles à enregistrer dans les logs',
});
//# sourceMappingURL=log-action.enum.js.map