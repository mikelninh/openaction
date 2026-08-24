import assert from 'node:assert/strict';

const rank={public:0,internal:1,restricted:2};
const flow={
  budget:3_000_000,
  nodes:[
    {id:'budget',status:'approved',amount:3_000_000,evidence:'budget-line',visibility:'public'},
    {id:'contract',status:'committed',amount:2_100_000,evidence:'contract-record',visibility:'public'},
    {id:'invoice',status:'invoiced',amount:750_000,evidence:'invoice-1',visibility:'restricted'},
    {id:'payment',status:'paid',amount:500_000,evidence:'payment-1',visibility:'internal'},
    {id:'reconcile',status:'reconciled',amount:500_000,evidence:'acceptance+payment',visibility:'public'},
  ]
};

const visible=(access,node)=>rank[access]>=rank[node.visibility];
const amountByStatus=s=>flow.nodes.filter(n=>n.status===s).reduce((a,n)=>a+n.amount,0);

// Every money-state must be evidence-backed and traceable to an authoritative reference.
for(const n of flow.nodes){assert.ok(n.id);assert.ok(n.evidence);assert.ok(n.visibility);assert.ok(n.amount>=0)}

// Financial semantics: these are distinct states and must never be conflated.
assert.notEqual(amountByStatus('invoiced'),amountByStatus('paid'));
assert.equal(amountByStatus('paid'),500_000);
assert.equal(amountByStatus('reconciled'),500_000);
assert.ok(amountByStatus('committed')<=flow.budget);

// An invoice is not proof that money was paid; payment is not proof the delivery was accepted.
const invoice=flow.nodes.find(n=>n.id==='invoice');
const payment=flow.nodes.find(n=>n.id==='payment');
const reconciliation=flow.nodes.find(n=>n.id==='reconcile');
assert.equal(invoice.status,'invoiced');
assert.equal(payment.status,'paid');
assert.equal(reconciliation.status,'reconciled');
assert.notEqual(invoice.id,payment.id);
assert.notEqual(payment.id,reconciliation.id);

// Public transparency and restricted detail are projections of the same graph.
assert.equal(visible('public',flow.nodes.find(n=>n.id==='budget')),true);
assert.equal(visible('public',invoice),false);
assert.equal(visible('restricted',invoice),true);
assert.equal(visible('public',reconciliation),true);

// Public projection must be able to follow budget -> contract -> outcome evidence without seeing protected invoice detail.
const publicNodes=flow.nodes.filter(n=>visible('public',n));
assert.deepEqual(publicNodes.map(n=>n.id),['budget','contract','reconcile']);

// One source of truth means references, not a second accounting ledger.
const projection={case_id:'gov-demo',references:flow.nodes.map(n=>({id:n.id,evidence:n.evidence,status:n.status}))};
assert.ok(projection.references.every(r=>r.evidence));
assert.equal(Object.hasOwn(projection,'bank_account'),false);

console.log('✓ Financial Flow V9 transparency invariants passed');
