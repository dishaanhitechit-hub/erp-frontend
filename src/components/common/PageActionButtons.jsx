import Image from "next/image";

export const getPageActions = ({
  onHome,
  onPrint,
  onDownload,
  onApprove,
  onBack ,
  onTimeLine
}) => {
  
  const btnClass = "cursor-pointer hover:scale-105 transition";

  const actions = [];

  if (onTimeLine) {
    actions.push(
      <button key="timeline" className={btnClass} onClick={onTimeLine}>
        <Image src="/assets/icons/timeline.png" alt="" width={32} height={32} />
      </button>
    );
  }

  if (onApprove) {
    actions.push(
      <button key="approve" className={btnClass} onClick={onApprove}>
        <Image src="/assets/icons/approval-action.png" alt="" width={32} height={32} />
      </button>
    );
  }

  if (onHome) {
    actions.push(
      <button key="home" className={btnClass} onClick={onHome}>
        <Image src="/assets/icons/home1.png" alt="" width={32} height={32} />
      </button>
    );
  }

  if (onBack) {
    actions.push(
      <button key="back" className={btnClass} onClick={onBack}>
        <Image src="/assets/icons/left-arrow1.png" alt="" width={32} height={32} />
      </button>
    );
  }

  if (onDownload) {
    actions.push(
      <button key="download" className={btnClass} onClick={onDownload}>
        <Image src="/assets/icons/file-download.png" alt="" width={32} height={32} />
      </button>
    );
  }

  if (onPrint) {
    actions.push(
      <button key="print" className={btnClass} onClick={onPrint}>
        <Image src="/assets/icons/printer.png" alt="" width={32} height={32} />
      </button>
    );
  }

  return actions;
};


// const actions = getPageActions({
//     onHome: () => clearAuthCookies(),
//     onPrint: () => window.print(),
//   });

{/* <PageHeader actions={actions} /> */}