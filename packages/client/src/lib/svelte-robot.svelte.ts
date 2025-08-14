import { interpret, type Machine, type MachineStates } from "robot3";
export function useMachine<
  S extends MachineStates<S, F>,
  C extends {},
  K extends string,
  F extends string,
>(machine: Machine<S, C, K, F>, context: C) {
  let service = $state(
    interpret(
      machine,
      (tx) => {
        service = tx;
      },
      context,
    ),
  );

  return {
    get machine() {
      return service.machine;
    },
    get context() {
      return service.context;
    },
    send(...args: Parameters<typeof service.send>) {
      service.send(...args);
    },
  };
}
