<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="vt_times")
 */
class Times{
	/**
	 * @ORM\Column(type="integer")
	 * @ORM\Id;
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	private $id;
	/**
	 * @ORM\Column(type="integer")
	 */
	private $mapId;
	/**
	 * @ORM\Column(type="datetime", nullable=true)
	 */
	private $createdAt;
	/**
	 * @ORM\Column(type="integer")
	 */
	private $playerId;
    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    private $finishTime;
	/**
	 * @ORM\Column(type="text", nullable=true)
	 */
	private $checkpointTimes;


    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set mapId
     *
     * @param integer $mapId
     *
     * @return Times
     */
    public function setMapId($mapId)
    {
        $this->mapId = $mapId;

        return $this;
    }

    /**
     * Get mapId
     *
     * @return integer
     */
    public function getMapId()
    {
        return $this->mapId;
    }

    /**
     * Set createdAt
     *
     * @param \DateTime $createdAt
     *
     * @return Times
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    /**
     * Get createdAt
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * Set playerId
     *
     * @param integer $playerId
     *
     * @return Times
     */
    public function setPlayerId($playerId)
    {
        $this->playerId = $playerId;

        return $this;
    }

    /**
     * Get playerId
     *
     * @return integer
     */
    public function getPlayerId()
    {
        return $this->playerId;
    }

    /**
     * Set finishTime
     *
     * @param integer $finishTime
     *
     * @return Times
     */
    public function setFinishTime($finishTime)
    {
        $this->finishTime = $finishTime;

        return $this;
    }

    /**
     * Get finishTime
     *
     * @return integer
     */
    public function getFinishTime()
    {
        return $this->finishTime;
    }

    /**
     * Set checkpointTimes
     *
     * @param string $checkpointTimes
     *
     * @return Times
     */
    public function setCheckpointTimes($checkpointTimes)
    {
        $this->checkpointTimes = $checkpointTimes;
        return $this;
    }

    /**
     * Get checkpointTimes
     *
     * @return string
     */
    public function getCheckpointTimes()
    {
        return $this->checkpointTimes;
    }

    private function _extract_checkpoint_times($sCheckpointTimes){
        preg_match_all('=(\d+([^\d]))+=', $sCheckpointTimes, $aMatches);
        $sDelimiter = $aMatches[2][0];
        return explode($sDelimiter, $sCheckpointTimes);
    }
    private function _extract_finish_time($sCheckpointTimes){
        return array_pop(($this->_extract_checkpoint_times($sCheckpointTimes)));
    }
    public function update_times($sNewCheckpointTimes){
        $iNewFinishTime = $this->_extract_finish_time($sNewCheckpointTimes);
        $bIsImprovement = !$this->finishTime || $iNewFinishTime < $this->finishTime;

        if($bIsImprovement){
            $this->setFinishTime($iNewFinishTime);
            $this->setCheckpointTimes($sNewCheckpointTimes);
            $this->setCreatedAt(new \DateTime());
        }

        return $bIsImprovement;
    }
}