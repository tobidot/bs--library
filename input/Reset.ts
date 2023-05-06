export function preventDefault(
    container: HTMLElement
): void {
    // prevent mouse wheel from scrolling page
    container.addEventListener(
        'wheel',
        (event) => {
            event.preventDefault();
        },
        {
            passive: false
        }
    );
    // prevent keydown to interact with page
    container.addEventListener(
        'keydown',
        (event) => {
            event.preventDefault();
        }
    );
    // prevent context menu from appearing
    container.addEventListener(
        'contextmenu',
        (event) => {
            event.preventDefault();
            event.stopPropagation();
        }
    );
}