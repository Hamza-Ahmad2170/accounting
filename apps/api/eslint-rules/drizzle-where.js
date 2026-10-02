//  @ts-check

/**
 * Drop-in replacement for `eslint-plugin-drizzle`'s where-clause rules.
 *
 * The upstream rules decide "was this call followed by `.where()`?" by
 * remembering the last member expression they happened to visit in a
 * module-level variable. That state is shared by every file ESLint processes,
 * so violations are silently missed whenever another statement or file leaves
 * the variable set to `where` — see drizzle-team/drizzle-orm#5612 and the
 * unmerged fix in #6374.
 *
 * These rules read parent pointers instead, so a report depends only on the
 * code actually being checked.
 *
 * @typedef {import("eslint").Rule.Node} RuleNode
 * @typedef {import("eslint").Rule.RuleModule} RuleModule
 */

/**
 * Static property name of a member expression, covering `a.b`, `a["b"]` and
 * the private `a.#b`.
 *
 * @param {RuleNode} node
 * @returns {string | null}
 */
function propertyName(node) {
  if (node.type !== "MemberExpression") return null;

  const { property } = node;
  if (node.computed) {
    return property.type === "Literal" && typeof property.value === "string"
      ? property.value
      : null;
  }
  return property.type === "Identifier" || property.type === "PrivateIdentifier"
    ? property.name
    : null;
}

/**
 * Name of the object a `delete` / `update` call hangs off, unwrapping
 * intermediate calls so `db.update(...)` and `ctx.db.update(...)` both resolve
 * to `db`.
 *
 * A private receiver (`this.#db`) resolves through the `MemberExpression`
 * branch, which yields `#db`.
 *
 * @param {RuleNode} node A `MemberExpression` node.
 * @returns {string | null}
 */
function receiverName(node) {
  if (node.type !== "MemberExpression") return null;

  let current = node.object;
  while (current) {
    switch (current.type) {
      case "Identifier":
        return current.name;
      case "MemberExpression":
        // Sub-nodes reached through `.object` carry plain ESTree types, but
        // ESLint attaches `parent` to every node it visits, so the cast holds.
        return propertyName(/** @type {RuleNode} */ (current));
      case "CallExpression":
      case "NewExpression":
        current = current.callee;
        break;
      case "ChainExpression":
        current = current.expression;
        break;
      default:
        return null;
    }
  }
  return null;
}

/**
 * Walk outward from a `.delete` / `.update` call through the member and call
 * chain looking for a `.where` access.
 *
 * Because this follows `parent` links it sees the whole chain regardless of
 * order, so `.update().set().from().where()` is accepted just like
 * `.update().set().where()`.
 *
 * @param {RuleNode} node The `.delete` / `.update` member expression.
 * @returns {boolean}
 */
function isFollowedByWhere(node) {
  let current = node;
  let parent = current.parent;

  while (parent) {
    if (parent.type === "MemberExpression" && parent.object === current) {
      if (propertyName(parent) === "where") return true;
      current = parent;
    } else if (
      parent.type === "CallExpression" &&
      parent.callee === current
    ) {
      current = parent;
    } else if (
      parent.type === "ChainExpression" &&
      parent.expression === current
    ) {
      current = parent;
    } else {
      return false;
    }
    parent = current.parent;
  }
  return false;
}

/**
 * @param {"delete" | "update"} method Member name to police.
 * @param {string} messageId
 * @param {string} description
 * @returns {RuleModule}
 */
function createRule(method, messageId, description) {
  return {
    meta: {
      type: "problem",
      docs: { description },
      schema: [
        {
          type: "object",
          properties: {
            drizzleObjectName: { type: ["string", "array"] },
          },
          additionalProperties: false,
        },
      ],
      messages: {
        [messageId]:
          "Without `.where(...)` this will affect every row in the table. Use `{{ drizzleObjName }}.{{ method }}(...).where(...)` if that is intended.",
      },
    },

    create(context) {
      const configured = (context.options[0] || {}).drizzleObjectName;
      /** @type {string[]} */
      const names =
        typeof configured === "string"
          ? [configured]
          : Array.isArray(configured)
            ? configured
            : [];

      return {
        MemberExpression(node) {
          // Only a real call counts, not a reference to the method itself.
          if (node.parent.type !== "CallExpression") return;
          if (node.parent.callee !== node) return;
          if (propertyName(node) !== method) return;

          const receiver = receiverName(node);
          // `this.#db` and `db` are treated as the same object.
          const bare = receiver === null ? null : receiver.replace(/^#/, "");
          if (bare === null) return;
          if (names.length > 0 && !names.includes(bare)) return;

          if (isFollowedByWhere(node)) return;

          context.report({
            node,
            messageId,
            data: { drizzleObjName: bare, method },
          });
        },
      };
    },
  };
}

/** @type {import("eslint").ESLint.Plugin} */
const plugin = {
  rules: {
    "enforce-delete-with-where": createRule(
      "delete",
      "enforceDeleteWithWhere",
      "Require a `.where()` clause so a delete cannot affect every row in a table.",
    ),
    "enforce-update-with-where": createRule(
      "update",
      "enforceUpdateWithWhere",
      "Require a `.where()` clause so an update cannot affect every row in a table.",
    ),
  },
};

export default plugin;