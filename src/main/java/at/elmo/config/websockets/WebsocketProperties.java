package at.elmo.config.websockets;

public class WebsocketProperties {

    private int messageBrokerMaxPoolSize;

    private int messageBrokerCorePoolSize;

    private int messageBrokerQueueCapacity;

    private int inBoundChannelMaxPoolSize;

    private int inBoundChannelCorePoolSize;

    private int inBoundChannelQueueCapacity;

    private int outBoundChannelMaxPoolSize;

    private int outBoundChannelCorePoolSize;

    private int outBoundChannelQueueCapacity;

    public int getMessageBrokerMaxPoolSize() {
        return messageBrokerMaxPoolSize;
    }

    public void setMessageBrokerMaxPoolSize(int messageBrokerMaxPoolSize) {
        this.messageBrokerMaxPoolSize = messageBrokerMaxPoolSize;
    }

    public int getMessageBrokerCorePoolSize() {
        return messageBrokerCorePoolSize;
    }

    public void setMessageBrokerCorePoolSize(int messageBrokerCorePoolSize) {
        this.messageBrokerCorePoolSize = messageBrokerCorePoolSize;
    }

    public int getMessageBrokerQueueCapacity() {
        return messageBrokerQueueCapacity;
    }

    public void setMessageBrokerQueueCapacity(int messageBrokerQueueCapacity) {
        this.messageBrokerQueueCapacity = messageBrokerQueueCapacity;
    }

    public int getInBoundChannelMaxPoolSize() {
        return inBoundChannelMaxPoolSize;
    }

    public void setInBoundChannelMaxPoolSize(int inBoundChannelMaxPoolSize) {
        this.inBoundChannelMaxPoolSize = inBoundChannelMaxPoolSize;
    }

    public int getInBoundChannelCorePoolSize() {
        return inBoundChannelCorePoolSize;
    }

    public void setInBoundChannelCorePoolSize(int inBoundChannelCorePoolSize) {
        this.inBoundChannelCorePoolSize = inBoundChannelCorePoolSize;
    }

    public int getInBoundChannelQueueCapacity() {
        return inBoundChannelQueueCapacity;
    }

    public void setInBoundChannelQueueCapacity(int inBoundChannelQueueCapacity) {
        this.inBoundChannelQueueCapacity = inBoundChannelQueueCapacity;
    }

    public int getOutBoundChannelMaxPoolSize() {
        return outBoundChannelMaxPoolSize;
    }

    public void setOutBoundChannelMaxPoolSize(int outBoundChannelMaxPoolSize) {
        this.outBoundChannelMaxPoolSize = outBoundChannelMaxPoolSize;
    }

    public int getOutBoundChannelCorePoolSize() {
        return outBoundChannelCorePoolSize;
    }

    public void setOutBoundChannelCorePoolSize(int outBoundChannelCorePoolSize) {
        this.outBoundChannelCorePoolSize = outBoundChannelCorePoolSize;
    }

    public int getOutBoundChannelQueueCapacity() {
        return outBoundChannelQueueCapacity;
    }

    public void setOutBoundChannelQueueCapacity(int outBoundChannelQueueCapacity) {
        this.outBoundChannelQueueCapacity = outBoundChannelQueueCapacity;
    }
}
